import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Notícias do JSON para migrar
const newsFromJson = [
  {
    slug: 'planejamento-tributario-clinicas-medicas-equiparacao-hospitalar',
    category: 'saude',
    image_url: '/images/noticia-clinicas-medicas.png',
    published_at: '2025-09-28',
    title: 'Planejamento Tributário para Clínicas Médicas: o poder da equiparação hospitalar',
    excerpt: 'Veja como clínicas e serviços de saúde podem reduzir a carga tributária de forma significativa por meio da equiparação hospitalar, com segurança e planejamento.',
    content: `<p>A equiparação hospitalar é uma estratégia tributária que permite que clínicas médicas e serviços de saúde sejam tributados de forma mais vantajosa, equiparando-se às regras aplicáveis aos hospitais.</p>
<p>Esta possibilidade está prevista na legislação brasileira e pode representar uma economia significativa no pagamento de tributos federais, especialmente IRPJ e CSLL.</p>
<p>Para se beneficiar dessa equiparação, a clínica precisa atender a requisitos específicos relacionados à estrutura física, aos serviços prestados e à forma de constituição jurídica.</p>
<p>Nossa equipe de especialistas analisa cada caso individualmente para verificar a elegibilidade e implementar as mudanças necessárias com total segurança jurídica.</p>`,
  },
  {
    slug: 'planejamento-tributario-varejo-e-ecommerce',
    category: 'varejo',
    image_url: '/images/noticia-varejo-ecommerce.png',
    published_at: '2025-09-28',
    title: 'Planejamento Tributário para Varejo e E-commerce: como pagar menos impostos',
    excerpt: 'Entenda os principais pontos de atenção para lojas físicas e e-commerces que desejam estruturar o planejamento tributário e reduzir custos com impostos.',
    content: `<p>O setor de varejo, tanto físico quanto digital, enfrenta uma complexa carga tributária que inclui PIS, COFINS, ICMS e ICMS-ST. Uma estrutura tributária bem planejada pode gerar economia significativa.</p>
<p>Para e-commerces, é fundamental entender as particularidades do ICMS interestadual e a substituição tributária, que variam conforme o estado de origem e destino das mercadorias.</p>
<p>A escolha do regime tributário adequado — Simples Nacional, Lucro Presumido ou Lucro Real — deve ser feita com base em análise detalhada do faturamento, margens e operações.</p>
<p>Nosso time acompanha as constantes mudanças na legislação para garantir que sua empresa esteja sempre em conformidade e aproveitando todas as oportunidades de economia.</p>`,
  },
  {
    slug: 'pl-1087-2025-lucros-e-altas-rendas',
    category: 'legislacao',
    image_url: '/images/noticia-pl-1087-2025.png',
    published_at: '2025-09-28',
    title: 'Entenda o PL 1.087/2025: nova tributação sobre lucros e altas rendas',
    excerpt: 'Resumo das principais mudanças propostas pelo PL 1.087/2025 e seus impactos para empresários e pessoas físicas de alta renda.',
    content: `<p>O Projeto de Lei 1.087/2025 propõe mudanças significativas na tributação de lucros e dividendos distribuídos por empresas, além de criar novas alíquotas para pessoas físicas de alta renda.</p>
<p>Entre as principais alterações, destaca-se a possibilidade de tributação de dividendos que hoje são isentos, o que pode impactar diretamente a estrutura de remuneração de sócios e acionistas.</p>
<p>O projeto também prevê ajustes nas alíquotas do Imposto de Renda para diferentes faixas de rendimento, buscando maior progressividade no sistema tributário brasileiro.</p>
<p>É essencial que empresários e gestores acompanhem a tramitação deste projeto e avaliem, com antecedência, possíveis ajustes em suas estruturas societárias e de distribuição de resultados.</p>`,
  },
  {
    slug: 'esocial-2025-mudancas',
    category: 'legislacao',
    image_url: '/images/blog/esocial-2025.jpg',
    published_at: '2025-08-15',
    title: 'eSocial 2025: principais mudanças e como se preparar',
    excerpt: 'Conheça as atualizações do eSocial para 2025 e saiba como manter sua empresa em conformidade com as novas exigências trabalhistas.',
    content: `<p>O eSocial continua evoluindo e trazendo novas exigências para as empresas brasileiras. Em 2025, algumas mudanças importantes entram em vigor.</p>
<p>As principais alterações incluem novos eventos relacionados à saúde e segurança do trabalho, além de ajustes nos prazos de envio de informações.</p>
<p>Empresas que não se adequarem às novas regras podem enfrentar multas e penalidades significativas.</p>
<p>Nossa equipe está preparada para auxiliar sua empresa na adaptação às novas exigências, garantindo conformidade e evitando problemas com a fiscalização.</p>`,
  },
  {
    slug: 'reforma-tributaria-mudancas-empresa',
    category: 'tributos',
    image_url: '/images/blog/reforma-tributaria.jpg',
    published_at: '2025-07-20',
    title: 'Reforma Tributária: o que muda para sua empresa',
    excerpt: 'Um resumo completo das mudanças propostas pela reforma tributária e como elas podem afetar diferentes setores da economia.',
    content: `<p>A reforma tributária brasileira promete simplificar o sistema de impostos, unificando tributos como PIS, COFINS, ICMS e ISS em um único imposto sobre valor agregado.</p>
<p>A transição será gradual, com período de adaptação previsto para os próximos anos, permitindo que empresas se preparem para as mudanças.</p>
<p>Setores como serviços, varejo e indústria serão impactados de formas diferentes, exigindo análise específica para cada tipo de negócio.</p>
<p>Acompanhar de perto essas mudanças e planejar com antecedência é fundamental para minimizar impactos negativos e aproveitar possíveis benefícios.</p>`,
  },
  {
    slug: 'organizar-fluxo-caixa-empresa',
    category: 'gestao',
    image_url: '/images/blog/fluxo-caixa.jpg',
    published_at: '2025-06-10',
    title: 'Como organizar o fluxo de caixa da sua empresa',
    excerpt: 'Dicas práticas para implementar um controle eficiente de fluxo de caixa e melhorar a saúde financeira do seu negócio.',
    content: `<p>O fluxo de caixa é uma das ferramentas mais importantes para a gestão financeira de qualquer empresa, independentemente do porte.</p>
<p>Um controle eficiente permite prever períodos de aperto financeiro, planejar investimentos e tomar decisões mais assertivas.</p>
<p>A categorização correta de receitas e despesas, aliada a projeções realistas, forma a base de um bom controle de caixa.</p>
<p>Nossa consultoria em gestão financeira pode ajudar sua empresa a implementar processos e ferramentas para um controle de caixa eficiente.</p>`,
  },
]

async function getSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore
          }
        },
      },
    }
  )
}

export async function POST() {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'dev') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const supabase = await getSupabase()
    const results = {
      success: [] as string[],
      errors: [] as string[],
      skipped: [] as string[],
    }

    for (const news of newsFromJson) {
      // Verificar se já existe
      const { data: existing } = await supabase
        .from('news')
        .select('id')
        .eq('slug', news.slug)
        .single()

      if (existing) {
        results.skipped.push(news.slug)
        continue
      }

      // Inserir notícia
      const { data: newsData, error: newsError } = await supabase
        .from('news')
        .insert({
          slug: news.slug,
          category: news.category,
          image_url: news.image_url,
          status: 'published',
          published_at: news.published_at,
        })
        .select()
        .single()

      if (newsError) {
        results.errors.push(`${news.slug}: ${newsError.message}`)
        continue
      }

      // Inserir tradução PT
      const { error: translationError } = await supabase
        .from('news_translations')
        .insert({
          news_id: newsData.id,
          locale: 'pt',
          title: news.title,
          excerpt: news.excerpt,
          content: news.content,
        })

      if (translationError) {
        results.errors.push(`${news.slug} (translation): ${translationError.message}`)
        // Deletar a notícia se a tradução falhou
        await supabase.from('news').delete().eq('id', newsData.id)
        continue
      }

      results.success.push(news.slug)
    }

    return NextResponse.json({
      message: 'Migração concluída',
      results,
    })
  } catch (error) {
    console.error('Erro na migração:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
