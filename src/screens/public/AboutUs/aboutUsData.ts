import { ImageSourcePropType } from 'react-native';

const FernandoChibliProfile = require('@assets/aboutus/Fer-profile.png');
const DouglasWenzelProfile = require('@assets/aboutus/Doug-profile.png');
const IsabelMaitoProfile = require('@assets/aboutus/Isa-profile.png');
const GustavoFerreiraProfile = require('@assets/aboutus/Gustavo-profile.png');
const EduardoKamoProfile = require('@assets/aboutus/Edu-profile.png');
const IagoRossanProfile = require('@assets/aboutus/Iago-profile.png');
const LucasConsaniProfile = require('@assets/aboutus/Lucas-profile.png');
const FernandoRibeiroProfile = require('@assets/aboutus/Fernando-profile2.png');

export interface Developer {
  id: number;
  name: string;
  role: string;
  initial: string;
  bio: string;
  photo: ImageSourcePropType;
  github?: string;
  linkedin?: string;
  portfolio?: string;
}

export const developers: Developer[] = [
  {
    id: 1,
    name: 'Douglas Wenzel',
    role: 'Scrum Master and Developer FullStack',
    initial: 'D',
    bio: 'Desenvolvedor de software com foco em soluções intuitivas, seguras e escaláveis. Possuo conhecimentos com Node.js no backend com Express + Sequelize, React Native no mobile, e Python para Machine Learning. Tenho olhar analítico pra segurança, busco código limpo e eficiente. Acredito em tecnologia acessível, por isso crio conteúdos didáticos. Simplicidade é o ápice da sofisticação, e é assim que eu programo. Nos intervalos dos commits, a Pitchuluca - minha filha de quatro patas - supervisiona tudo em casa.',
    photo: DouglasWenzelProfile,
    github: 'https://github.com/douglaswenzel',
    linkedin: 'https://www.linkedin.com/in/douglas-wenzel',
    portfolio: 'https://douglaswenzel.vercel.app',
  },

  {
    id: 2,
    name: 'Eduardo Kamo',
    role: 'Developer Frontend',
    initial: 'E',
    bio: 'Desenvolvedor Full Stack / Frontend com sólida base em JavaScript/TypeScript e especialização no ecossistema React. Com foco no desenvolvimento mobile híbrido usando React Native e construção de APIs eficientes para o ecossistema web, atua na criação de soluções escaláveis, modernas e com alta performance de interface.',
    photo: EduardoKamoProfile,
    github: 'https://github.com/edukamoz',
    linkedin: 'https://www.linkedin.com/in/eduardo-kamo/',
    portfolio: 'https://edukamoz.github.io/my-portfolio/',
  },

  {
    id: 3,
    name: 'Fernando Chibli',
    role: 'CTO and Developer FullStack',
    initial: 'F',
    bio: 'Desenvolvedor com sólida experiência em desenvolvimento de software com Node, Python, React e Java. Formado em Tecnologia em Jogos Digitais, conta com uma carreira de mais de 11 (onze) anos de experiência nacional e internacional trazendo soluções e melhorias para projetos em diversas tecnologias, de aplicativos mobile à servidores em nuvem.',
    photo: FernandoChibliProfile,
    github: 'https://github.com/fershibli',
    linkedin: 'https://www.linkedin.com/in/fernando-luiz-neme-chibli-25623169',
    portfolio: 'https://portfolio-fershibli.vercel.app/',
  },

  {
    id: 4,
    name: 'Fernando Ribeiro',
    role: 'Developer FullStack',
    initial: 'F2',
    bio: 'Desenvolvedor focado em Frontend, sempre buscando novas formas de melhorar o visual e acessibilidade dos meus projetos. Acredito que a tecnologia deve ser para todos e meu aprendizado pode trazer a facilidade a quem quiser acessar. Tenho 20 anos e estou cursando DSM (Desenvolvimento de Sistemas Multiplataforma). Atualmente tenho como profissão Analista de Sistemas com uma ponta em Correspondente Bancário na Pulse Client Experts, onde aplico tudo que aprendi até hoje.',
    photo: FernandoRibeiroProfile,
    github: 'https://github.com/FernandoRSantos',
    linkedin: 'https://www.linkedin.com/in/fernando-ribeiro-a9a405301/',
    portfolio:
      'https://cloudflare-workers-autoconfig-portifolio.fernandorsantos2802.workers.dev/',
  },

  {
    id: 5,
    name: 'Gustavo Ferreira',
    role: 'Developer Frontend',
    initial: 'G',
    bio: 'Sou Frontend Software Developer, apaixonado por criar interfaces que sejam ao mesmo tempo bonitas, funcionais e fáceis de usar. Trabalho com desenvolvimento web utilizando principalmente React, JavaScript/TypeScript, HTML e CSS, sempre buscando escrever código limpo, reutilizável e bem estruturado. Estou em constante evolução, aprimorando minhas habilidades em arquitetura frontend, boas práticas de desenvolvimento e integração com APIs.',
    photo: GustavoFerreiraProfile,
    github: 'https://github.com/Gspedine',
    linkedin: 'https://www.linkedin.com/in/gustavo-lopes-ferreira-1245b7179/',
    portfolio: 'https://gspedine.github.io/Portifolio-main/',
  },

  {
    id: 6,
    name: 'Iago Rossan',
    role: 'Developer FullStack',
    initial: 'I2',
    bio: 'Profissional de TI de 24 anos com perfil sociável, analítico e focado em negócios. Minha trajetória começou no suporte de hardware e evoluiu por áreas de logística e comercial (Selbetti), o que me deu uma visão completa da jornada do cliente. Atualmente cursando Desenvolvimento de Software (Fatec) e atuando na Faktory Softwares, utilizo minha bagagem técnica e comercial para traduzir as necessidades dos usuários, apoiar o desenvolvimento de sistemas e aplicar soluções eficientes e adaptáveis.',
    photo: IagoRossanProfile,
    github: 'https://github.com/IagoYuriRossan',
    linkedin: 'https://www.linkedin.com/in/iago-yuri-rossan-ab792419b/',
    portfolio: 'https://iago-rossan.vercel.app',
  },

  {
    id: 7,
    name: 'Isabel Maito',
    role: 'Designer and Developer FullStack',
    initial: 'I',
    bio: 'Formada em Design Gráfico e com mais de uma década de atuação no setor editorial, trago um olhar apurado para usabilidade e hierarquia visual que aplico diretamente na criação de interfaces centradas no usuário. Como Desenvolvedora Frontend e Fullstack, uno essa forte base criativa a mais de dois anos de experiência técnica na construção de aplicações web do zero. Possuo domínio prático de todo o ciclo de desenvolvimento, atuando com autonomia desde o levantamento de requisitos e prototipagem no Figma até a codificação frontend, integração com APIs REST e modelagem de dados, utilizando tecnologias como React, Node.js e MySQL.',
    photo: IsabelMaitoProfile,
    github: 'https://github.com/isabelmaito',
    linkedin: 'https://www.linkedin.com/in/isabelmaito/',
    portfolio: 'https://www.isabelmaito.com.br/',
  },

  {
    id: 8,
    name: 'Lucas Consani',
    role: 'Developer FullStack',
    initial: 'L',
    bio: 'Desenvolvedor Full Stack em formação, apaixonado por tecnologia e criação de soluções modernas. Tenho experiência com desenvolvimento web e mobile utilizando React, Angular, TypeScript e Java, além de atuação com infraestrutura de redes e suporte técnico. Busco sempre desenvolver aplicações organizadas, intuitivas e eficientes, unindo aprendizado contínuo, resolução de problemas e boas práticas de desenvolvimento.',
    photo: LucasConsaniProfile,
    github: 'https://github.com/konsanii',
    linkedin: 'https://www.linkedin.com/in/lucas-consani-0a742b159/',
    portfolio: 'https://konsanii.github.io/Portifolio/',
  },
];
