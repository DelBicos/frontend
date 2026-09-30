import React from 'react';
import { useRoute } from '@react-navigation/native';
import PageContainer, { PageHeader } from '@components/layout/PageContainer';
import Chip, { ChipGroup } from '@components/ui/Chip';

import { useAppNavigation } from '@screens/useAppNavigation';
const SECTIONS = [
  { route: 'AdminDashboard', label: 'Painel' },
  { route: 'AdminAnalytics', label: 'Analytics' },
  { route: 'AdminDisputes', label: 'Disputas' },
  { route: 'AdminVerifications', label: 'Verificações' },
] as const;

interface AdminShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

/** Moldura das telas de administrador: mesmo cabecalho e margens do site + navegacao entre secoes. */
function AdminShell({ title, subtitle, children }: AdminShellProps) {
  const navigation = useAppNavigation();
  const route = useRoute();

  return (
    <PageContainer>
      <PageHeader eyebrow="Administração" title={title} subtitle={subtitle}>
        <ChipGroup accessibilityLabel="Seções da administração">
          {SECTIONS.map((section) => (
            <Chip
              key={section.route}
              label={section.label}
              selected={route.name === section.route}
              onPress={() => {
                if (route.name !== section.route) {
                  navigation.navigate(section.route);
                }
              }}
            />
          ))}
        </ChipGroup>
      </PageHeader>
      {children}
    </PageContainer>
  );
}

export default AdminShell;
