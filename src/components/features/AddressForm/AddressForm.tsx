import Autocomplete from '@components/ui/Autocomplete/Autocomplete';
import CustomSelect from '@components/ui/CustomSelect/CustomSelect';
import CustomTextInput from '@components/ui/CustomTextInput';
import { useIBGE } from '@lib/hooks//useIBGE';
import { useViaCepStore } from '@stores/ViaCep';
import { useColors } from '@theme/ThemeProvider';
import React from 'react';
import {
  Control,
  Controller,
  FieldErrors,
  UseFormSetValue,
  useWatch,
} from 'react-hook-form';
import { ActivityIndicator, Text, View } from 'react-native';
import { createStyles } from './styles';

export interface AddressFormData {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

/** Formularios que contem os campos de endereco (o cadastro tem outros alem deles). */
interface AddressFormProps<T extends AddressFormData> {
  control: Control<T>;
  errors: FieldErrors<T>;
  setValue: UseFormSetValue<T>;
  onSubmit?: () => void;
}

export function AddressForm<T extends AddressFormData>({
  control: formControl,
  errors: formErrors,
  setValue: formSetValue,
  onSubmit,
}: AddressFormProps<T>) {
  // O react-hook-form e invariante no tipo do formulario: aqui so os campos
  // de endereco importam, entao o formulario e visto como AddressFormData.
  const control = formControl as unknown as Control<AddressFormData>;
  const errors = formErrors as unknown as FieldErrors<AddressFormData>;
  const setValue = formSetValue as unknown as UseFormSetValue<AddressFormData>;
  const { fetchCep, loading: cepLoading, error: cepError } = useViaCepStore();
  const colors = useColors();
  const styles = createStyles(colors);

  const selectedState = useWatch({ control, name: 'state' });
  const { states, cities, loadingCities } = useIBGE(selectedState);

  const handleCepBlur = async (cepValue: string) => {
    const cleanCep = cepValue?.replace(/\D/g, '');

    if (cleanCep?.length === 8) {
      const data = await fetchCep(cleanCep);

      if (data && !data.erro) {
        // Atualiza o estado. O CustomSelect deve reagir à mudança de value
        setValue('state', data.uf, { shouldValidate: true, shouldDirty: true });
        setValue('street', data.logradouro || '', { shouldValidate: true });
        setValue('neighborhood', data.bairro || '', { shouldValidate: true });

        // Atualiza a cidade. O Autocomplete deve reagir à mudança da prop 'value'
        setValue('city', data.localidade, {
          shouldValidate: true,
          shouldDirty: true,
        });

        // Foco opcional no número (se desejar UX fluida)
        // setFocus('number');
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* --- CEP --- */}
      <Controller
        control={control}
        name="cep"
        rules={{
          required: 'CEP é obrigatório',
          pattern: { value: /^\d{5}-?\d{3}$/, message: 'CEP inválido' },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.cepContainer}>
            <CustomTextInput
              label="CEP"
              placeholder="00000-000"
              value={value}
              onChangeText={(text) => {
                const masked = text
                  .replace(/\D/g, '')
                  .replace(/^(\d{5})(\d)/, '$1-$2')
                  .slice(0, 9);
                onChange(masked);
                if (masked.length === 9) handleCepBlur(masked);
              }}
              onBlur={() => {
                onBlur();
                handleCepBlur(value);
              }}
              error={errors.cep?.message}
              keyboardType="numeric"
              maxLength={9}
            />
            {cepLoading && (
              <ActivityIndicator
                size="small"
                color={colors.primaryOrange}
                style={styles.loader}
              />
            )}
            {cepError && <Text style={styles.errorText}>{cepError}</Text>}
          </View>
        )}
      />

      {/* --- RUA E NÚMERO --- */}
      <View style={styles.row}>
        <View style={[styles.col, { flex: 3 }]}>
          <Controller
            control={control}
            name="street"
            rules={{ required: 'Rua é obrigatória' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomTextInput
                label="Rua"
                placeholder="Ex: Rua das Flores"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.street?.message}
              />
            )}
          />
        </View>
        <View style={[styles.col, { flex: 1 }]}>
          <Controller
            control={control}
            name="number"
            rules={{ required: 'Nº obrigatório' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomTextInput
                label="Número"
                placeholder="123"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.number?.message}
                keyboardType="numeric"
              />
            )}
          />
        </View>
      </View>

      {/* --- COMPLEMENTO --- */}
      <View>
        <Controller
          control={control}
          name="complement"
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomTextInput
              label="Complemento (Opcional)"
              placeholder="Ex: Apto 101"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.complement?.message}
            />
          )}
        />
      </View>

      {/* --- BAIRRO --- */}
      <View>
        <Controller
          control={control}
          name="neighborhood"
          rules={{ required: 'Bairro é obrigatório' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomTextInput
              label="Bairro"
              placeholder="Ex: Centro"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.neighborhood?.message}
            />
          )}
        />
      </View>

      {/* --- ESTADO E CIDADE --- */}
      <View style={[styles.row, styles.cityRow]}>
        <View style={[styles.col, { flex: 1 }]}>
          <Controller
            control={control}
            name="state"
            rules={{ required: 'UF obrigatória' }}
            render={({ field: { onChange, value } }) => (
              <CustomSelect
                label="Estado"
                placeholder="UF"
                options={states}
                value={value}
                onChange={(val) => {
                  onChange(val);
                  setValue('city', '');
                }}
                error={errors.state?.message as string}
                loading={states.length === 0}
              />
            )}
          />
        </View>
        <View style={[styles.col, { flex: 2 }]}>
          <Controller
            control={control}
            name="city"
            rules={{ required: 'Cidade obrigatória' }}
            render={({ field: { onChange, value } }) => (
              <Autocomplete
                label="Cidade"
                placeholder={
                  selectedState ? 'Digite para buscar...' : 'Selecione o estado'
                }
                data={cities}
                value={value}
                onChange={onChange}
                error={errors.city?.message as string}
                loading={loadingCities}
                disabled={!selectedState || loadingCities}
              />
            )}
          />
        </View>
      </View>

      {onSubmit && <View style={styles.footer}></View>}
    </View>
  );
}
