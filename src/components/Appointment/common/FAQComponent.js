import React from 'react';
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
    question: 'What is an online doctor consultation?',
    answer:
      'Online consultation allows you to connect with doctors via chat, audio, or video call.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Yes, all consultations are end-to-end encrypted, and your data is stored securely.',
  },
  {
    question: 'Can I get a prescription?',
    answer:
      'Yes, doctors provide digital prescriptions after the consultation if necessary.',
  },
];

const FaqSection = () => {
  return (
    <Container sx={{ py: 5 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Frequently Asked Questions
      </Typography>
      {faqData.map((item, index) => (
        <Accordion key={index} sx={{ my: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{item.question}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>{item.answer}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Container>
  );
};

export default FaqSection;
