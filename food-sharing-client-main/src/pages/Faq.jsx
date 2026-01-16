import { useState } from "react";

const faqs = [
  {
    question: "How does food sharing work?",
    answer:
      "Users can share surplus food by posting it on our platform, and others can request to pick it up.",
  },
  {
    question: "Is the food safe to eat?",
    answer:
      "Yes. We encourage users to follow safety guidelines and only share fresh and edible food.",
  },
  {
    question: "Do I need to pay for shared food?",
    answer:
      "Sometimes, yes. Pricing depends on the donor, though many choose to donate for free.",
  },
  {
    question: "How do I request food?",
    answer:
      "Browse available food, click request, and arrange a pickup with the donor.",
  },
];

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleItem = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="section-pad">
      <div className="page-wrap">
        <div className="max-w-3xl mx-auto">
          <h2 className="section-title text-center">
            Frequently Asked Questions
          </h2>
          <p className="section-subtitle text-center mt-3">
            Quick answers to help you share, request, and stay safe.
          </p>

          <div className="space-y-4 mt-10">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              const contentId = `faq-content-${index}`;
              return (
                <div key={index} className="card-surface overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleItem(index)}
                    aria-expanded={isOpen}
                    aria-controls={contentId}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left text-lg font-semibold text-cocoa focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/40"
                  >
                    <span>{faq.question}</span>
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-cream text-amber-700 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </span>
                  </button>
                  <div
                    id={contentId}
                    className={`px-5 pb-5 text-clay leading-relaxed transition-[max-height,opacity] duration-300 ${
                      isOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
                    } overflow-hidden`}
                  >
                    <div className="pt-2">{faq.answer}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
export default Faq;
