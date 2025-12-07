import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: process.env.PORT || 3001,
  KAFKA_BROKERS: process.env.KAFKA_BROKERS?.split(",") || ["kafka:9092"],
  DATABASE_URL: process.env.DATABASE_URL!,
};
