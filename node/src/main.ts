import { config } from "dotenv";
import crypto from "crypto";
import FormData from "form-data";
import fetch from "node-fetch";
import NodeRSA from "node-rsa";
import {
  Client
} from "alith/lazai";
import {
  encrypt
} from "alith/data";
import {
  PinataIPFS,
  UploadOptions,
  GetShareLinkOptions,
  StorageError,
  FileMetadata,
} from "alith/data/storage";

config();

interface ActualPinataUploadResponse {
  id: string;
  name: string;
  cid: string;
  size: number;
  number_of_files: number;
  mime_type: string;
  created_at: string;
  updated_at: string;
  network: string;
  streamable: boolean;
  accept_duplicates?: boolean;
  is_duplicate?: boolean;
  group_id?: string;
}

class CustomPinataIPFS extends PinataIPFS {
  async upload(opts: UploadOptions): Promise<FileMetadata> {
    const url = "https://uploads.pinata.cloud/v3/files";

    const form = new FormData();
    form.append("file", opts.data, {
      filename: opts.name,
      contentType: "text/plain",
    });
    form.append("network", "public");

    const headers = {
      Authorization: `Bearer ${opts.token}`,
    };

    const response = await fetch(url, { method: "POST", body: form, headers });

    if (!response.ok) {
      const errorText = await response.text();
      throw new StorageError(`Pinata IPFS API error: ${errorText}`);
    }

    const data = await response.json() as { data: ActualPinataUploadResponse };
    const pinataResponse = data.data;

    return {
      id: pinataResponse.cid,
      name: pinataResponse.name,
      size: pinataResponse.size,
      modified_time: pinataResponse.updated_at,
    } as FileMetadata;
  }
}

async function main(): Promise<void> {
  const privateKey = process.env.PRIVATE_KEY?.startsWith('0x') 
    ? process.env.PRIVATE_KEY 
    : `0x${process.env.PRIVATE_KEY}`;
  const client = new Client(undefined, undefined, privateKey);
  const ipfs = new CustomPinataIPFS();

  try {
    // 1️⃣ Encrypt Data
    const dataFileName = "your_encrypted_data.txt";
    const privacyData = "Your Privacy Data";
    const fileHash = crypto
      .createHash("sha256")
      .update(privacyData)
      .digest("hex");

    const encryptionSeed = "Sign to retrieve your encryption key";
    const password = "example_password";

    const encryptedData = await encrypt(Buffer.from(privacyData), password);

    // 2️⃣ Upload to IPFS
    const token = process.env.IPFS_JWT ?? "";
    const fileMeta = await ipfs.upload({
      name: dataFileName,
      data: Buffer.from(encryptedData),
      token,
    });

    const url = await ipfs.getShareLink({
      token,
      id: fileMeta.id,
    });

    // 3️⃣ Register File with LazAI
    let fileId = await client.getFileIdByUrl(url);

    if (fileId === 0n) {
      const resultFileId = await client.addFileWithHash(url, fileHash);
      fileId = resultFileId;
    }

    // 4️⃣ Request Proof from Node
    await client.requestProof(fileId, 100n);
    const jobIds = await client.fileJobIds(fileId);
    const jobId = jobIds[jobIds.length - 1];
    const job = await client.getJob(jobId);
    const nodeAddress = job.nodeAddress;
    const nodeInfo = await client.getNode(nodeAddress);

    const nodeUrl = nodeInfo.url;
    const pubKeyPem = nodeInfo.publicKey;

    let encryptionKey: string;
    try {
      const pubKey = new NodeRSA();
      pubKey.importKey(pubKeyPem, "pkcs1-public");
      encryptionKey = pubKey.encrypt(password, "hex");
    } catch (rsaError) {
      encryptionKey = Buffer.from(password).toString('hex');
    }

    const proofRequest = {
      job_id: jobId.toString(),
      file_id: fileId.toString(),
      file_url: url,
      encryption_key: encryptionKey,
      encryption_seed: encryptionSeed,
      proof_url: null,
    };

    await fetch(`${nodeUrl}/proof`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(proofRequest),
    });

    // 5️⃣ Request Reward
    const rewardResult = await client.requestReward(fileId);
    
    // Simple output: only File ID and Transaction Hash
    console.log("File ID:", fileId.toString());
    console.log("Transaction Hash:", rewardResult.transactionHash);
    console.log("�� https://testnet-explorer.lazai.network/tx/" + rewardResult.transactionHash);
    
    // Exit cleanly
    process.exit(0);

  } catch (err) {
    if (err instanceof StorageError) {
      console.error("Storage Error:", (err as Error).message);
    } else {
      console.error("Unhandled Error:", err);
    }
    process.exit(1);
  }
}

main().catch((err) => console.error("Main error:", err));
