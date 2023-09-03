import mongoose from "mongoose";

mongoose.set("strictQuery", false);

async function main() {
  console.log("Connecting to database...");
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/livy");
  console.log("Connected to database.");
}

export default mongoose;
export { main };
