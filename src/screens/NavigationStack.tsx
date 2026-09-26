import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { useColors } from '@theme/ThemeProvider';
import Feed from './public/Feed';
import NotFound from './public/NotFound';
import RegisterScreen from './public/RegisterScreen';
import VerificationScreen from './public/VerificationScreen';
import PartnerProfile from './public/PartnerProfile';
import { NavigationParams } from './types';
import Login from './public/Login';
import Header from '@components/layout/Header';
import ProfessionalWebNav from '@components/layout/ProfessionalWebNav';
import { useUserStore } from '@stores/User';
import ForgotPassword from './public/ForgotPassword';
import CategoryScreen from './public/Category';
import SubCategoryScreen from './public/SubCategoryScreen';
import SearchResultScreen from './public/SearchResultScreen';
import CheckoutScreen from './public/CheckoutScreen';
import PaymentStatusScreen from './public/PaymentStatusScreen';
import MySchedulesScreen from './private/client/MySchedulesScreen';
import HelpScreen from '@screens/public/HelpScreen';
import AboutUsScreen from '@screens/public/AboutUs';
import AdminDashboard from './private/admin/AdminDashboard';
import AdminAnalytics from './private/admin/AdminAnalytics';
import ProfessionalDashboard from './private/ProfessionalDashboard';
import ProfileScreen from '@screens/private/client/Profile/Tabs/ProfileScreen';
import ServicesListScreen from '@screens/private/professional/Services/ServicesList';
import ChatListScreen from '@screens/private/chat/ChatListScreen';
import ChatThreadScreen from '@screens/private/chat/ChatThreadScreen';
import ChatBotScreen from '@screens/private/chatbot/ChatBotScreen';

const Tab = createBottomTabNavigator();

// A barra padrao das abas fica oculta: os apps usam o BottomNav (renderizado
// fora dos navegadores em App.tsx) para o menu seguir visivel mesmo quando
// uma tela e empilhada sobre as abas. Na web a navegacao e pelo Header.
const useTabScreenOptions = () => {
  const colors = useColors();
  return {
    headerShown: false,
    sceneStyle: { backgroundColor: colors.cardBackground },
  };
};

const MainTabs = () => (
  <Tab.Navigator tabBar={() => null} screenOptions={useTabScreenOptions()}>
    <Tab.Screen name="FeedTab" component={Feed} options={{ title: 'Início' }} />
    <Tab.Screen
      name="CategoryTab"
      component={CategoryScreen}
      options={{ title: 'Buscar' }}
    />
    <Tab.Screen
      name="SchedulesTab"
      component={MySchedulesScreen}
      options={{ title: 'Agenda' }}
    />
    <Tab.Screen
      name="ProfileTab"
      component={ProfileScreen}
      options={{ title: 'Perfil' }}
    />
  </Tab.Navigator>
);

// No web, o painel do colaborador ganha uma barra de secoes no topo.
const ProfessionalTabs = () => (
  <Tab.Navigator
    tabBar={(props) =>
      Platform.OS === 'web' ? <ProfessionalWebNav {...props} /> : null
    }
    screenOptions={{
      ...useTabScreenOptions(),
      tabBarPosition: 'top',
    }}>
    <Tab.Screen
      name="ProfessionalHomeTab"
      component={ProfessionalDashboard}
      options={{ title: 'Início' }}
    />
    <Tab.Screen
      name="ProfessionalSchedulesTab"
      component={MySchedulesScreen}
      options={{ title: 'Agenda' }}
    />
    <Tab.Screen
      name="ProfessionalServicesTab"
      component={ServicesListScreen}
      options={{ title: 'Serviços' }}
    />
    <Tab.Screen
      name="ProfessionalProfileTab"
      component={ProfileScreen}
      options={{ title: 'Perfil' }}
    />
  </Tab.Navigator>
);

// Home: Sempre abre o MainTabs (ou ProfessionalTabs) no Mobile e Feed na Web
const Home = () => {
  const user = useUserStore((state) => state.user);
  if (Platform.OS === 'web') {
    return <Feed />;
  }
  return user?.professional_id ? <ProfessionalTabs /> : <MainTabs />;
};

const RootStack = createNativeStackNavigator({
  screenOptions: {
    header: (props) => <Header {...props} />,
  },
  screens: {
    Home: {
      screen: Home,
    },
    MainTabs: {
      screen: MainTabs,
    },
    Login: {
      screen: Login,
      linking: {
        path: 'login',
      },
      options: {
        headerShown: false,
        title: 'Entrar',
      },
    },
    ForgotPassword: {
      screen: ForgotPassword,
      linking: {
        path: 'forgot-password',
      },
      options: {
        headerShown: false,
        title: 'Recuperar senha',
      },
    },
    Feed: {
      screen: Feed,
      linking: {
        path: 'feed',
      },
    },
    PartnerProfile: {
      screen: PartnerProfile,
      linking: {
        path: 'partner/:id',
        parse: {
          id: (value) => value,
        },
        stringify: {
          id: (value) => value,
        },
      },
    },
    Register: {
      screen: RegisterScreen,
      linking: {
        path: 'register',
      },
      options: {
        headerShown: false,
        title: 'Criar conta',
      },
    },
    VerificationScreen: {
      screen: VerificationScreen,
      options: {
        headerShown: false,
        title: 'Confirmar e-mail',
      },
    },
    ClientProfile: {
      screen: ProfileScreen,
      linking: {
        // Use wildcard so any nested path under client-profile is handled by the app
        path: 'client-profile/*',
      },
    },
    Category: {
      screen: CategoryScreen,
      linking: {
        path: 'categories',
      },
      options: {
        title: 'Categorias', // Título que pode ser usado pelo Header
      },
    },
    SubCategoryScreen: {
      screen: SubCategoryScreen,
      linking: {
        path: 'category/:categoryId',
        parse: {
          categoryId: (value) => Number(value), // Converte o ID da URL para número
        },
      },
      options: {
        title: 'Serviços',
      },
    },
    SearchResult: {
      screen: SearchResultScreen,
      linking: {
        path: 'search', // A URL será algo como /search?subcategory=...&date=...
      },
      options: {
        title: 'Resultados da Busca',
      },
    },
    Checkout: {
      screen: CheckoutScreen,
      linking: {
        path: 'checkout', // A URL será algo como /checkout?professionalId=...&time=...
      },
      // No web, o cabecalho do site continua visivel durante o agendamento.
      options: {
        title: 'Pagamento',
      },
    },
    PaymentStatus: {
      screen: PaymentStatusScreen,
      linking: {
        path: 'payment-status', // <-- Esta é a URL de retorno
      },
      options: {
        title: 'Agendamento',
      },
    },
    MySchedules: {
      screen: MySchedulesScreen,
      options: {
        title: 'Meus Agendamentos',
      },
    },
    ProfessionalTabs: {
      screen: ProfessionalTabs,
      linking: {
        path: 'professional',
        screens: {
          ProfessionalHomeTab: '',
          ProfessionalSchedulesTab: 'schedules',
          ProfessionalServicesTab: 'services',
          ProfessionalProfileTab: 'profile',
        },
      },
      options: {
        // No web mostra o cabecalho do site (no app a navegacao e pela barra inferior).
        headerShown: Platform.OS === 'web',
        title: 'Painel do colaborador',
      },
    },
    Help: {
      screen: HelpScreen,
      linking: {
        path: 'help',
      },
      options: {
        title: 'Central de Ajuda',
      },
    },
    AboutUs: {
      screen: AboutUsScreen,
      linking: {
        path: 'about-us',
      },
      options: {
        title: 'Sobre Nós',
      },
    },
    AdminDashboard: {
      screen: AdminDashboard,
      linking: {
        path: 'admin-dashboard',
      },
      options: {
        title: 'Admin',
      },
    },
    AdminAnalytics: {
      screen: AdminAnalytics,
      linking: {
        path: 'admin-analytics',
      },
      options: {
        title: 'Analytics',
      },
    },
    ChatList: {
      screen: ChatListScreen,
      linking: {
        path: 'chats',
      },
      options: {
        title: 'Conversas',
      },
    },
    ChatThread: {
      screen: ChatThreadScreen,
      linking: {
        path: 'chat/:roomId',
        parse: {
          roomId: (value: string) => Number(value),
        },
      },
      options: {
        headerShown: false,
      },
    },
    ChatBot: {
      screen: ChatBotScreen,
      linking: {
        path: 'chatbot',
      },
      options: {
        title: 'Assistente',
        headerShown: false,
      },
    },
    /**
     *  IMPORTANTE: NÃO REMOVA ESTE COMENTÁRIO
     *  IMPORTANTE: NÃO ADICIONE NENHUMA ROTA APÓS ESTA
     *    Rota curinga para 404 - deve ser a última definida para não sobrescrever outras rotas
     */
    NotFound: {
      screen: NotFound,
      linking: {
        path: '*',
      },
    },
  },
});

export const Navigation = createStaticNavigation(RootStack);

type RootStackParamList = NavigationParams;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
