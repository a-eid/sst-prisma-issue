import fs from "fs-extra"
import path from "node:path"
import * as lambda from "aws-cdk-lib/aws-lambda"
import { StackContext, Function } from "sst/constructs"
export const LAYER_MODULES = ["encoding", "@prisma/client/runtime"]

function preparePrismaLayerFiles() {
  const layerPath = "./layers/prisma"
  fs.rmSync(layerPath, { force: true, recursive: true })
  fs.mkdirSync(layerPath, { recursive: true })
  const files = ["node_modules/.prisma", "node_modules/@prisma/client", "node_modules/prisma/build"]
  for (const file of files) {
    // Do not include binary files that aren't for AWS to save space
    fs.copySync(file, path.join(layerPath, "nodejs", file), {
      filter: src => !src.endsWith("so.node") || src.includes("rhel"),
    })
  }
}

export function API({ stack }: StackContext) {
  preparePrismaLayerFiles()
  const prismaLayer = new lambda.LayerVersion(stack, "PrismaLayer", {
    description: "Prisma layer",
    code: lambda.Code.fromAsset("./layers/prisma"),
  })

  const lambdaFn = new Function(stack, "trpcLambda", {
    handler: "packages/functions/src/index.main",
    runtime: "nodejs18.x",
    layers: [prismaLayer],
    timeout: 15,
    memorySize: 1024,
    url: true,
    environment: { DATABASE_URL: process.env.DATABASE_URL! },
    nodejs: {
      // format: "esm",
      esbuild: {
        external: LAYER_MODULES.concat(["@prisma/engines", "@prisma/engines-version", "@prisma/internals"]),
        sourcemap: true,
      },
    },
    copyFiles: [
      {
        from: "packages/functions/prisma/schema.prisma",
        to: "packages/functions/src/schema.prisma",
      },
      {
        from: "packages/functions/node_modules/prisma/libquery_engine-linux-arm64-openssl-1.0.x.so.node",
        to: "packages/functions/src/libquery_engine-linux-arm64-openssl-1.0.x.so.node",
      },
      {
        from: "packages/functions/node_modules/prisma/libquery_engine-rhel-openssl-1.0.x.so.node",
        to: "packages/functions/src/libquery_engine-rhel-openssl-1.0.x.so.node",
      },
    ],
  })

  stack.addOutputs({
    lambdaUrl: lambdaFn.url,
  })
}
