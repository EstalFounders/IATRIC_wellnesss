import React from 'react';
import { useLanguage } from "../../../i18n/LanguageContext";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Container,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const faqData = [
  {
    qKey: 'faq.q1',
    aKey: 'faq.a1',
  },
  {
    qKey: 'faq.q2',
    aKey: 'faq.a2',
  },
  {
    qKey: 'faq.q3',
    aKey: 'faq.a3',
  },
];

const FaqSection = () => {
  const { t } = useLanguage();
  return (
    <Container sx={{ py: 5 }}>
      <Typography variant="h4" align="center" gutterBottom>
        {t("faq.title")}
      </Typography>
      {faqData.map((item, index) => (
        <Accordion key={index} sx={{ my: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{t(item.qKey)}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>{t(item.aKey)}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Container>
  );
};

export default FaqSection;
