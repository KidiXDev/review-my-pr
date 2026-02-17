# ReviewMyPR

**ReviewMyPR** is a self-hosted SaaS designed to bridge the gap between GitHub code reviews and instant communication. It delivers real-time Pull Request notifications directly to your team on WhatsApp, enhancing productivity and reducing response times.

> **Note**: This project is currently in early development. Some features may not yet be fully implemented and may display only the user interface without underlying functionality.

## Key Features

- **Instant Notifications**: Get notified on WhatsApp the moment a PR is opened, reviewed, or merged.
- **Team Sync**: Keep your entire development team in the loop via WhatsApp groups.
- **Sleek Dashboard**: A modern, data-driven interface to manage your repositories and notification settings.
- **Self-Hostable**: Full control over your data. Deploy it on your own infrastructure.
- **Secure**: Uses anonymous tokens and follows security best practices to protect your repository data.
- **Multi-Tenant**: Built as a SaaS platform, supporting multiple users and organizations.

## Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [Better Auth](https://better-auth.com/)
- **Real-time Notifications**: [WhatsApp Baileys](https://github.com/WhiskeySockets/Baileys)
- **Caching/Queue**: [Redis](https://redis.io/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

## Getting Started

### Prerequisites

- **Node.js**: v20 or higher
- **pnpm**: Recommended package manager
- **PostgreSQL**: For persistent data storage
- **Redis**: For managing sessions and background tasks

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/KidiXDev/review-my-pr.git
   cd review-my-pr
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and fill in the required values:
   ```bash
   cp .env.example .env
   ```
   *Required variables include `DATABASE_URL`, `REDIS_HOST`, `REDIS_PASSWORD`, `BETTER_AUTH_SECRET`, and `GOOGLE_CLIENT_ID/SECRET`.*

4. **Initialize Database**:
   ```bash
   pnpm run db:push
   ```

5. **Run the development server**:
   ```bash
   pnpm dev
   ```

## Docker Setup

ReviewMyPR can be easily deployed using Docker.

### Using Docker Compose

1. **Configure Environment Variables**:
   Ensure your `.env` file contains the necessary secrets (Google Auth, etc.).

2. **Start the stack**:
   ```bash
   docker compose up -d
   ```
   This will start the application, PostgreSQL, and Redis containers.

3. **Verify**:
   The application will be available at `http://localhost:3000`.

## Self-Hosting as a SaaS

ReviewMyPR is designed to be easily self-hosted. 

- **Docker Integration**: (Coming Soon)
- **Deployment**: Can be deployed on Vercel, Railway, or any VPS supporting Node.js.
- **License**: Released under the **AGPL-3.0 License**, making it free and open-source for self-hosting while ensuring improvements are shared back with the community.

## License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**. See the [LICENSE](LICENSE) file for details.
