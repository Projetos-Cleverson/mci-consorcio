export const SIMULATION_CONFIG = {
  financing: {
    /**
     * Taxa mensal orientativa.
     * Exemplo: 0.0095 = 0,95% ao mês.
     * Ajuste aqui quando quiser atualizar a taxa base.
     */
    monthlyInterestRate: 0.0095,

    /**
     * Limite conservador de comprometimento da renda.
     * 0.3 = 30% da renda familiar.
     */
    maxIncomeCommitment: 0.3,

    /**
     * Prazo orientativo para financiamento imobiliário.
     * 360 meses = 30 anos.
     */
    defaultTermMonths: 360,
  },

  consortium: {
  /**
   * Prazo orientativo do consórcio.
   */
  defaultTermMonths: 200,

  /**
   * Taxa administrativa referencial conservadora.
   * 0.25 = 25% diluído no prazo.
   */
  adminFeeRate: 0.25,

  /**
   * Fundo de reserva referencial conservador.
   * 0.04 = 4% diluído no prazo.
   */
  reserveFundRate: 0.04,

  /**
   * Seguro ou outros custos estimados.
   * Pode deixar 0 por enquanto.
   */
  insuranceRate: 0,
},
};