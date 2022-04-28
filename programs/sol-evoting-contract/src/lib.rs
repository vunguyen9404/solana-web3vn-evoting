use anchor_lang::prelude::*;
pub mod schemas;
pub use schemas::*;

pub mod instructions;
pub use instructions::*;

pub mod error;
pub use error::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod sol_evoting_contract {
    use super::*;

    pub fn initialize_candidate(
        ctx: Context<InitializeCandidate>,
        start_date: i64,
        end_date: i64,
    ) -> Result<()> {
        initialize_candidate::exec(ctx, start_date, end_date)
    }

    pub fn vote(ctx: Context<Vote>, amount: u64) -> Result<()> {
        vote::exec(ctx, amount)
    }

    pub fn close(ctx: Context<Close>) -> Result<()> {
        close::exec(ctx)
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    pub authority: Signer<'info>
}
