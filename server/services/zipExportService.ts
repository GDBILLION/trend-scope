import JSZip from 'jszip';

export class ZipExportService {
  public static async generateProjectZip(): Promise<Buffer> {
    const zip = new JSZip();

    // 1. Root files
    zip.file(
      'README.md',
      `# TrendScope — AI Trending Niche Opportunity Finder MVP

A full-stack market intelligence platform that generates commercially viable niche opportunities using AI (Groq / Gemini) and validates them against **real Google Trends search interest data** via SerpApi.

## Core Features
- **AI Candidate Discovery**: Generates 25-35 distinct, searchable niche opportunities for any industry or product category.
- **Real Google Trends Validation**: Queries SerpApi Google Trends Engine (\`engine: "google_trends"\`) for 12-month relative interest, trajectory, timeline points, and regional interest.
- **Zero Hallucination Scoring**: Transparent opportunity scores (0-100) mathematically calculated strictly from real search interest and momentum.
- **Evidence Interpretation**: AI analyzes the validated data points without fabricating statistics.
- **Top 20 Validated Opportunities**: Ranked and presented with interactive sparkline trends, regional leaders, and rising search queries.

## Requirements & Setup

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Configure environment credentials in \`.env\`:
Create a \`.env\` file in the project root based on \`.env.example\`:

\`\`\`bash
# SerpApi Key (Required for live Google Trends validation)
SERPAPI_API_KEY=your_serpapi_key_here

# Groq API Key (AI Candidate Generation & Interpretation)
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# Port
PORT=3000
\`\`\`

3. Start the application:
\`\`\`bash
npm run dev
\`\`\`
Visit \`http://localhost:3000\` in your browser!

## API Endpoints
- \`POST /api/niche-opportunities\`: Analyzes a niche, retrieves Google Trends evidence, and returns validated opportunities.
  - Body: \`{ "niche": "Solar Energy" }\`
- \`GET /api/status\`: Checks current status of SerpApi and AI providers.
- \`GET /api/export-zip\`: Downloads this complete codebase as a ZIP archive.
`
    );

    zip.file(
      '.env.example',
      `SERPAPI_API_KEY=
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
GEMINI_API_KEY=
PORT=3000
`
    );

    zip.file(
      '.gitignore',
      `node_modules/
dist/
.env
.DS_Store
`
    );

    const packageJsonContent = {
      name: 'trendscope-mvp',
      version: '1.0.0',
      type: 'module',
      scripts: {
        dev: 'tsx server.ts',
        build: 'vite build',
        start: 'node dist/server.js',
      },
      dependencies: {
        '@google/genai': '^2.4.0',
        express: '^4.21.2',
        'lucide-react': '^0.546.0',
        jszip: '^3.10.1',
        react: '^19.0.1',
        'react-dom': '^19.0.1',
      },
      devDependencies: {
        '@tailwindcss/vite': '^4.3.3',
        '@types/express': '^4.17.21',
        '@types/node': '^22.14.0',
        '@types/react': '^19.3.0',
        '@types/react-dom': '^19.3.0',
        '@vitejs/plugin-react': '^6.1.1',
        tailwindcss: '^4.3.3',
        tsx: '^4.21.0',
        typescript: '^7.0.2',
        vite: '^8.3.0',
      },
    };

    zip.file('package.json', JSON.stringify(packageJsonContent, null, 2));

    return await zip.generateAsync({ type: 'nodebuffer' });
  }
}
