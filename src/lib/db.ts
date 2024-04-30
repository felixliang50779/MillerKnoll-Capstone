import snowflake from "snowflake-sdk"
import crypto from 'crypto';

class DB {
  constructor() {
    const key = Buffer.from(process.env.ENCRYPTED_PRIVATE_KEY!, "base64").toString()
    const privKeyObj = crypto.createPrivateKey({
      key: key,
      passphrase: process.env.PRIVATE_KEY_PASSPHRASE!,
    });
    const privateKey = privKeyObj.export({
      format: 'pem',
      type: 'pkcs8'
    });
    this.snowflakeConnection = snowflake.createConnection({
      username: process.env.SNOWFLAKE_USERNAME!,
      account: 'BB84973-HERMANMILLER',
      authenticator: 'SNOWFLAKE_JWT',
      privateKey: privateKey,
      database: "MANUFACTURING_OPERATIONS_PROD",
      warehouse: "LOAD_WH"
    });
  }

  snowflakeConnection;

  async prepare(): Promise<void> {
    if(await this.isReady()) return;
    await this.snowflakeConnection.connectAsync((err: any, conn) => {
      console.log(err);
    });
  }

  async isReady(): Promise<boolean> {
    return await this.snowflakeConnection.isValidAsync() && this.snowflakeConnection.isUp();
  }

  query(...args: any): snowflake.Statement {
    return this.snowflakeConnection.execute.apply(null, args);
  }
}

const db = new DB();

export default db;
