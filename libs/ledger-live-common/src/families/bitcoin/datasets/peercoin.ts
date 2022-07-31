import type { CurrenciesData } from "@ledgerhq/types-live";
import type { Transaction } from "../types";
const dataset: CurrenciesData<Transaction> = {
  FIXME_ignoreAccountFields: [
    "bitcoinResources.walletAccount", // it is not "stable"
    "bitcoinResources.utxos", // TODO: fix ordering
  ],
  scanAccounts: [
    {
      name: "peercoin seed 1",
      apdus: `
      => b001000000
      <= 010850656572636f696e05312e362e339000
      => e04000000d038000002c8000000680000000
      <= 4104bf3614e4ebe909f34b3b87cf41e63647dd1266704fcbf28f7037836c129962fdc6ead43b3811ec109d710415f7cb2260e542ee8711776512fe22979e629bea5b22504d594b4751766365547745566d4179474a5356347737776d74486f45686d323662c215aca47fa1195960a1ca12db234dcb492ba9e7a8e7eb5a636a6bc43103b0429000
      => e016000000
      <= 0037007502065050436f696e035050439000
      => b001000000
      <= 010850656572636f696e05312e362e339000
      => e040000015058000002c80000006800000000000000000000000
      <= 410480c7eb66e9df7d3301346a8a7223db5c5de5e36ecc9214542a71c4253cd6b8af47e4e4047e5ab00ebc4a6cd79cafd42d26159c69d89e9f4402196b0f49a4a9a5225044337731657152554a4764384b36373857534456715539716366696a6d55374a5364cca48d4a9ff10028fa35c5d6c91ca252f752d7e01dd05900b8904949c591b59000
      => e016000000
      <= 0037007502065050436f696e035050439000
      => b001000000
      <= 010850656572636f696e05312e362e339000
      => e040000009028000002c80000006
      <= 41048e52c784b196af9b7bdb7298c37c141e4b3567542af30074561ed91ecc7530492f1bd4322b4855fe4272db0bf338f6a05606851ff749d3e194c04fe25a6b6fd122503958466862716f526359324c73696f523967366a3279316e7169597a454d774d531db6ca1e056c930b571eedee1d7550aaf611363590412c914769e9ecf49103b69000
      => e04000000d038000002c8000000680000000
      <= 4104bf3614e4ebe909f34b3b87cf41e63647dd1266704fcbf28f7037836c129962fdc6ead43b3811ec109d710415f7cb2260e542ee8711776512fe22979e629bea5b22504d594b4751766365547745566d4179474a5356347737776d74486f45686d323662c215aca47fa1195960a1ca12db234dcb492ba9e7a8e7eb5a636a6bc43103b0429000
      => b001000000
      <= 010850656572636f696e05312e362e339000
      => e040000015058000002c80000006800000010000000000000000
      <= 4104bdb39b3aebde2c22821e180c96ce0ee29c59c310ef2e51ee2793b2a74ecf9346d5af4504ebe89f193818166e3327df3d4148e1a9db9f6eed4099e678cd99dabe2250416e6f4e734d3671686a614b64764d3832656f466e7a474b534756467268767a4837c0adbd03c9d1bf4de79ab2a619542cf9ba86a573ac0c378613d55b8135ca479000
      => e016000000
      <= 0037007502065050436f696e035050439000
      => b001000000
      <= 010850656572636f696e05312e362e339000
      => e040000009028000002c80000006
      <= 41048e52c784b196af9b7bdb7298c37c141e4b3567542af30074561ed91ecc7530492f1bd4322b4855fe4272db0bf338f6a05606851ff749d3e194c04fe25a6b6fd122503958466862716f526359324c73696f523967366a3279316e7169597a454d774d531db6ca1e056c930b571eedee1d7550aaf611363590412c914769e9ecf49103b69000
      => e04000000d038000002c8000000680000001
      <= 41045574b2617cf6711794b8a9f60fccd929499bacdc160524418a0dc26c4eb8806fbd0ca53974113881c18a2cdd8ba85eacbb4fbd7ff241eb77a6121005022e04f6225053413966764c6d51794c75576f633274724175376746415034316443696936476e256bb2b665da792a3b04cc2c7d4248ef62551ac8c5ed5720a12e2d419a6d9f849000
      => b001000000
      <= 010850656572636f696e05312e362e339000
      => e040000015058000002c80000006800000020000000000000000
      <= 410478f94e4f634d45ca93d27b9568544c02a36085ae56abf5c74dd05e8da9e70fae0d7e06778ed1a1f5d42e4433bcc2c3646a1a8c69de4d83d5a766e468a57b6c1322504e57794266323563624d783943456a7679784a527444746734324741583277783866c6bd58ac83230563bcc5745494646f110608825868fa5ce9a15dbae0583fda9000
      => e016000000
      <= 0037007502065050436f696e035050439000
      => b001000000
      <= 010850656572636f696e05312e362e339000
      => e040000009028000002c80000006
      <= 41048e52c784b196af9b7bdb7298c37c141e4b3567542af30074561ed91ecc7530492f1bd4322b4855fe4272db0bf338f6a05606851ff749d3e194c04fe25a6b6fd122503958466862716f526359324c73696f523967366a3279316e7169597a454d774d531db6ca1e056c930b571eedee1d7550aaf611363590412c914769e9ecf49103b69000
      => e04000000d038000002c8000000680000002
      <= 4104c1ac69c32eca8b0e3edbf9b84243e9a39b5983b62d788dbf1ccb95389c33568c4a4bd1ef7c3864dd167497975ff6d5de318a282e1460b23d50c8f754a0e3c64b22504338685438686e444d796436326b4b57617a6f67484a35367663664532384c74331f97d12677e3c6830350974b2c322a8e1950344db294ec167e9723e4d760417b9000
      `,
    },
  ],
};
export default dataset;
