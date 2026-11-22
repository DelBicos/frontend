import { ImageSourcePropType } from 'react-native';

const FernandoChibliProfile = require('@assets/aboutus/Fer-profile.png');
const DouglasWenzelProfile = require('@assets/aboutus/Doug-profile.png');
const IsabelMaitoProfile = require('@assets/aboutus/Isa-profile.png');

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
    id: 3,
    name: 'Isabel Maito',
    role: 'Designer and Developer FullStack',
    initial: 'I',
    bio: 'Formada em Design Gráfico e com mais de uma década de atuação no setor editorial, trago um olhar apurado para usabilidade e hierarquia visual que aplico diretamente na criação de interfaces centradas no usuário. Como Desenvolvedora Frontend e Fullstack, uno essa forte base criativa a mais de dois anos de experiência técnica na construção de aplicações web do zero. Possuo domínio prático de todo o ciclo de desenvolvimento, atuando com autonomia desde o levantamento de requisitos e prototipagem no Figma até a codificação frontend, integração com APIs REST e modelagem de dados, utilizando tecnologias como React, Node.js e MySQL.',
    photo: IsabelMaitoProfile,
    github: 'https://github.com/isabelmaito',
    linkedin: 'https://www.linkedin.com/in/isabelmaito/',
    portfolio: 'https://www.isabelmaito.com.br/',
  },
];
