import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons';
import { Platform, Image } from 'react-native';
import { useColors } from '@theme/ThemeProvider';
import Feed from './public/Feed';
import NotFound from './public/NotFound';
import RegisterScreen from './public/RegisterScreen';
import VerificationScreen from './public/VerificationScreen';
import PartnerProfile from './public/PartnerProfile';
import { NavigationParams } from './types';
import Login from './public/Login';
import Header from '@components/layout/Header';
import { useUserStore } from '@stores/User';
import { LoginPassword } from './public/LoginPassword';
import CategoryScreen from './public/Category';
import SubCategoryScreen from './public/SubCategoryScreen';
import SearchResultScreen from './public/SearchResultScreen';
import CheckoutScreen from './public/CheckoutScreen/CheckoutScreen';
import PaymentStatusScreen from './public/PaymentStatusScreen';
import MySchedulesScreen from './private/client/MySchedulesScreen';
import HelpScreen from '@screens/public/HelpScreen';
import AboutUsScreen from '@screens/public/AboutUs';
import AdminDashboard from './private/admin/AdminDashboard';
import AdminAnalytics from './private/admin/AdminAnalytics';
import ProfessionalDashboard from './private/ProfessionalDashboard';
import ProfileScreen from '@screens/private/client/Profile/Tabs/ProfileScreen';
import ServicesListScreen from '@screens/private/professional/Services/ServicesList';
import ProfessionalRadiusScreen from '@screens/private/professional/RadiusScreen/ProfessionalRadiusScreen';
import ChatListScreen from '@screens/private/chat/ChatListScreen';
import ChatThreadScreen from '@screens/private/chat/ChatThreadScreen';
import ChatBotScreen from '@screens/private/chatbot/ChatBotScreen';

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const { user } = useUserStore();
  const colors = useColors();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.cardBackground },
        tabBarStyle:
          Platform.OS === 'web'
            ? { display: 'none' }
            : {
                backgroundColor: colors.cardBackground,
                borderTopWidth: 1,
                borderTopColor: colors.borderColor,
                height: 60,
                paddingBottom: 8,
                paddingTop: 8,
              },
        tabBarActiveTintColor: colors.primaryOrange,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontFamily: 'Afacad-SemiBold',
          fontSize: 12,
        },
      }}>
      <Tab.Screen
        name="FeedTab"
        component={Feed}
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CategoryTab"
        component={CategoryScreen}
        options={{
          title: 'Buscar',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="search" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SchedulesTab"
        component={MySchedulesScreen}
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="calendar-o" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) =>
            user?.avatar_uri ? (
              <Image
                source={{ uri: user.avatar_uri }}
                style={{
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  borderWidth: 1,
                  borderColor: color,
                }}
              />
            ) : (
              <FontAwesome name="user-o" size={size} color={color} />
            ),
        }}
      />
    </Tab.Navigator>
  );
};

const ProfessionalTabs = () => {
  const { user } = useUserStore();
  const colors = useColors();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.cardBackground },
        tabBarStyle:
          Platform.OS === 'web'
            ? { display: 'none' }
            : {
                backgroundColor: colors.cardBackground,
                borderTopWidth: 1,
                borderTopColor: colors.borderColor,
                height: 60,
                paddingBottom: 8,
                paddingTop: 8,
              },
        tabBarActiveTintColor: colors.primaryOrange,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontFamily: 'Afacad-SemiBold',
          fontSize: 12,
        },
      }}>
      <Tab.Screen
        name="ProfessionalHomeTab"
        component={ProfessionalDashboard}
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfessionalSchedulesTab"
        component={MySchedulesScreen}
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="calendar-o" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfessionalServicesTab"
        component={ServicesListScreen}
        options={{
          title: 'Serviços',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="wrench" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfessionalProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) =>
            user?.avatar_uri ? (
              <Image
                source={{ uri: user.avatar_uri }}
                style={{
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  borderWidth: 1,
                  borderColor: color,
                }}
              />
            ) : (
              <FontAwesome name="user-o" size={size} color={color} />
            ),
        }}
      />
    </Tab.Navigator>
  );
};

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
      },
    },
    LoginPassword: {
      screen: LoginPassword,
      linking: {
        path: 'login-password',
      },
      options: {
        headerShown: false,
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
      },
    },
    VerificationScreen: {
      screen: VerificationScreen,
      options: {
        headerShown: false, // Para manter a consistência com as telas de login/registro
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
      options: {
        headerShown: false, // Opcional: Esconde o header padrão
      },
    },
    PaymentStatus: {
      screen: PaymentStatusScreen,
      linking: {
        path: 'payment-status', // <-- Esta é a URL de retorno
      },
      options: {
        headerShown: false, // Sem header
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
        headerShown: false,
      },
    },
    Help: {
      screen: HelpScreen,
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
    ProfessionalArea: {
      screen: ProfessionalRadiusScreen,
      options: {
        title: 'Área de Atendimento',
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
