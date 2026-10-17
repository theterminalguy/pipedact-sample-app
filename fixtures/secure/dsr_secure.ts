// Simulated database client
const db = {
  userProfile: {
    findUnique: async (q: any) => ({ userId: q.where.userId, name: "Alex Tremblay" })
  },
  billingTransactions: {
    findMany: async (q: any) => [{ id: "tx_1", amount: 49.00, currency: "CAD" }]
  },
  auditLogs: {
    findMany: async (q: any) => [{ event: "LOGIN", timestamp: new Date().toISOString() }]
  }
};

// SECURE: Complete DSAR archive including transactions and accessLogs
export async function generateUserArchive(userId: string) {
  const profile = await db.userProfile.findUnique({ where: { userId } });
  const transactions = await db.billingTransactions.findMany({ where: { userId } });
  const accessLogs = await db.auditLogs.findMany({ where: { userId } });

  return {
    exportedAt: new Date().toISOString(),
    records: {
      profile,
      transactions,
      accessLogs
    }
  };
}
