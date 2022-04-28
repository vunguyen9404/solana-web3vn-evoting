# Solana E-voting System (web3vn camp)
----
## Installing Dependencies
To get started, make sure to setup all the prerequisite tools on your local machine (an installer has not yet been developed).

1. Setup Rust

```
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
rustup component add rustfmt
```

2. Setup Solana

```
sh -c "$(curl -sSfL https://release.solana.com/v1.9.1/install)"
```

3. Generate Solana key

```
solana-keygen new
```

4. Install Yarn

```
npm install -g yarn
```

5. Install Anchor CLI

```
npm i -g @project-serum/anchor-cli
```

### Command
1. Build bpf and idl

```
anchor build
```

2. Run test with localnet

```
anchor test
```

## Minimum version requirements
| Build tool  | Version  |
|---|---|
| NodeJs  | v11.0.0  |
