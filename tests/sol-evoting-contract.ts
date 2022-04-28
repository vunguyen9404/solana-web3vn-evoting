import {
  web3,
  utils,
  BN,
  Spl,
  AnchorProvider,
  Program,
  workspace,
  setProvider,
} from '@project-serum/anchor'
import { SolEvotingContract } from '../target/types/sol_evoting_contract'
import { initializeAccount, initializeMint } from './pretest'

describe('Solana E-Voting Contract', () => {
  // Configure the client to use the local cluster.
  const provider = AnchorProvider.local()
  setProvider(provider)
  // Program
  const program = workspace.SolEvotingContract as Program<SolEvotingContract>
  const splProgram = Spl.token()
  // Context
  const candidate = new web3.Keypair()
  let treasurer: web3.PublicKey
  const mint = new web3.Keypair()
  let candidateTokenAccount: web3.PublicKey

  let walletTokenAccount: web3.PublicKey
  let ballot: web3.PublicKey

  before(async () => {
    // Init a mint
    await initializeMint(9, mint, provider)
    // Derive treasurer account
    const [treasurerPublicKey] = await web3.PublicKey.findProgramAddress(
      [Buffer.from('treasurer'), candidate.publicKey.toBuffer()],
      program.programId,
    )
    treasurer = treasurerPublicKey
    const [ballotPublicKey] = await web3.PublicKey.findProgramAddress(
      [
        Buffer.from('ballot'),
        candidate.publicKey.toBuffer(),
        provider.wallet.publicKey.toBuffer(),
      ],
      program.programId,
    )
    ballot = ballotPublicKey

    // Derive token account
    walletTokenAccount = await utils.token.associatedAddress({
      mint: mint.publicKey,
      owner: provider.wallet.publicKey,
    })
    candidateTokenAccount = await utils.token.associatedAddress({
      mint: mint.publicKey,
      owner: treasurerPublicKey,
    })

    // Create Token account + Mint to token
    await initializeAccount(
      walletTokenAccount,
      mint.publicKey,
      provider.wallet.publicKey,
      provider,
    )
    await splProgram.methods.mintTo(new BN(1_000_000_000_000)).accounts(
      {
        mint: mint.publicKey,
        to: walletTokenAccount,
        authority: provider.wallet.publicKey,
      }
    ).rpc();
  })

  it('initialize candidate', async () => {
    const now = Math.floor(new Date().getTime() / 1000)
    const startTime = new BN(now)
    const endTime = new BN(now + 5)

    await program.methods.initializeCandidate(startTime, endTime)
    .accounts(
      {
        authority: provider.wallet.publicKey,
        candidate: candidate.publicKey,
        treasurer,
        mint: mint.publicKey,
        candidateTokenAccount,
        tokenProgram: utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      }
    ).signers([candidate]).rpc();
  })

  it('vote', async () => {
    await program.methods.vote(new BN(1)).accounts(
      {
        authority: provider.wallet.publicKey,
        candidate: candidate.publicKey,
        treasurer,
        mint: mint.publicKey,
        candidateTokenAccount,
        ballot,
        voterTokenAccount: walletTokenAccount,
        tokenProgram: utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      }
    ).signers([]).rpc();
  })

  it('close', async () => {
    setTimeout(async () => {
      await program.methods.close().accounts(
        {
          authority: provider.wallet.publicKey,
          candidate: candidate.publicKey,
          treasurer,
          mint: mint.publicKey,
          candidateTokenAccount,
          ballot,
          voterTokenAccount: walletTokenAccount,
          tokenProgram: utils.token.TOKEN_PROGRAM_ID,
          associatedTokenProgram: utils.token.ASSOCIATED_PROGRAM_ID,
          systemProgram: web3.SystemProgram.programId,
          rent: web3.SYSVAR_RENT_PUBKEY,
        }
      ).signers([]).rpc();
    }, 30000)
  })
})