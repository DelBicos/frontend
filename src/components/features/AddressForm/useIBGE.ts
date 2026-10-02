import { useState, useEffect } from 'react';
import { Option } from '@components/ui/CustomSelect/CustomSelect';

const BASE_URL = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados';

export const useIBGE = (selectedState: string) => {
  const [states, setStates] = useState<Option[]>([]);
  const [cities, setCities] = useState<Option[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchStates = async () => {
      try {
        const res = await fetch(`${BASE_URL}?orderBy=nome`);
        const data = await res.json();
        if (mounted) {
          setStates(
            data.map((uf: any) => ({ label: uf.sigla, value: uf.sigla })),
          );
        }
      } catch (e) {
        console.error('Erro ao buscar estados:', e);
      }
    };
    fetchStates();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    if (selectedState) {
      setLoadingCities(true);
      const fetchCities = async () => {
        try {
          const res = await fetch(`${BASE_URL}/${selectedState}/municipios`);
          const data = await res.json();
          if (mounted) {
            setCities(
              data.map((city: any) => ({ label: city.nome, value: city.nome })),
            );
          }
        } catch (e) {
          console.error('Erro ao buscar cidades:', e);
        } finally {
          if (mounted) setLoadingCities(false);
        }
      };
      fetchCities();
    } else {
      setCities([]);
    }
    return () => {
      mounted = false;
    };
  }, [selectedState]);

  return { states, cities, loadingCities };
};
