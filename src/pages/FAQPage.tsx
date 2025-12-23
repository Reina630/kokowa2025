import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Layout from "@/components/layout/Layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "Qu'est-ce que le Kokowa ?",
    answer:
      "Le Kokowa est la lutte traditionnelle nigérienne, un sport ancestral pratiqué depuis des siècles. C'est un symbole de force, d'honneur et de fierté nationale qui rassemble toutes les régions du Niger.",
  },
  {
    question: "Comment fonctionne le système de pronostics ?",
    answer:
      "Avant chaque combat, vous pouvez sélectionner le lutteur que vous pensez voir gagner. Si votre pronostic est correct, vous gagnez des points. Plus vous accumulez de points, plus vous montez dans le classement général.",
  },
  {
    question: "Comment soutenir un lutteur ?",
    answer:
      "Vous pouvez montrer votre soutien en cliquant sur le bouton 'Soutenir' sur la carte du lutteur. Vous pouvez également envoyer une récompense financière qui sera transmise directement au champion.",
  },
  {
    question: "Comment envoyer une récompense ?",
    answer:
      "Cliquez sur 'Récompenser' sur la carte du lutteur, choisissez un montant prédéfini ou entrez un montant personnalisé. Le paiement se fait via les services de mobile money disponibles au Niger.",
  },
  {
    question: "Quand se déroule le Sabre National 2025 ?",
    answer:
      "La 46ème édition du Sabre National se tiendra à Tahoua. Les dates exactes et le programme complet seront annoncés prochainement sur cette plateforme.",
  },
  {
    question: "Puis-je modifier mon pronostic après l'avoir soumis ?",
    answer:
      "Non, une fois votre pronostic validé, il ne peut plus être modifié. Assurez-vous de bien réfléchir avant de confirmer votre choix.",
  },
  {
    question: "Comment sont calculés les points du classement ?",
    answer:
      "Chaque pronostic correct vous rapporte 100 points de base. Des bonus sont accordés pour les pronostics des phases finales : +50% en quarts de finale, +75% en demi-finale, et +100% pour la finale.",
  },
  {
    question: "Y a-t-il des prix pour les meilleurs pronostiqueurs ?",
    answer:
      "Oui ! Les trois meilleurs pronostiqueurs du classement final recevront des récompenses spéciales, incluant des places VIP pour la prochaine édition du Sabre National.",
  },
];

const FAQPage = () => {
  return (
    <Layout>
      <div className="pt-24 pb-16 min-h-screen">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-heading text-4xl md:text-5xl font-bold uppercase text-foreground mb-4">
              Questions Fréquentes
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Tout ce que vous devez savoir sur Kokowa 2025
            </p>
          </motion.div>

          {/* FAQ Accordion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            <Accordion type="single" collapsible className="space-y-4">
              {faqItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <AccordionItem
                    value={`item-${index}`}
                    className="bg-card border border-border rounded-xl overflow-hidden px-6"
                  >
                    <AccordionTrigger className="font-heading text-left text-foreground hover:text-primary hover:no-underline py-5 text-base md:text-lg">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-5 text-base leading-relaxed">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-16"
          >
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas trouvé la réponse à votre question ?
            </p>
            <motion.a
              href="mailto:contact@kokowa.ne"
              whileTap={{ scale: 0.95 }}
              className="inline-block btn-hero-primary px-8 py-4"
            >
              Contactez-nous
            </motion.a>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default FAQPage;
