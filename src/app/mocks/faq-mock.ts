import { Faq } from '../Model/Faq/faq';
import { FaqItem } from '../Model/Faq/faq-item';
import { FaqSection } from '../Model/Faq/faq-section';

export const faqItemList1: FaqItem[] = [
  {
    title: '¿COmo loremp Ipsum',
    description: 'Lorem ipusum dolo etsum '
  },
  {
    title: '¿COmo loremp Ipsum',
    description: 'Lorem ipusum dolo etsum '
  },
  {
    title: '¿COmo loremp Ipsum',
    description: 'Lorem ipusum dolo etsum '
  },
  {
    title: '¿COmo loremp Ipsum',
    description: 'Lorem ipusum dolo etsum '
  },
  {
    title: '¿COmo loremp Ipsum',
    description: 'Lorem ipusum dolo etsum '
  }
];

export const faqSection: FaqSection[] = [
  {
    title: ' Ayuda',
    items: faqItemList1
  },
  {
    title: 'Seccion 2',
    items: faqItemList1
  },
  {
    title: ' Seccion 3',
    items: faqItemList1
  }
];



export const MESSAGES: Faq[] =
  [
    //message1
    {
      id: 'UNO',
      title: 'Lorem Ipsum',
      faqSection: faqSection
    },
    //message1
    {
      id: 'DOS',
      title: 'Lorem Ipsum',
      faqSection: faqSection
    },
    //message1
    {
      id: 'TRES',
      title: 'Lorem Ipsum',
      faqSection: faqSection
    },
    //message1
    {
      id: 'CUATRO',
      title: 'Lorem Ipsum',
      faqSection: faqSection
    },
    //message1
    {
      id: 'string',
      title: 'Lorem Ipsum',
      faqSection: faqSection
    },
    //message1
    {
      id: 'string',
      title: 'Lorem Ipsum',
      faqSection: faqSection
    }
  ];
