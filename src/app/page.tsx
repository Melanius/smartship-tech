export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          스마트십 기술 연구
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          주요 조선사와 기술 기업들의 스마트십 기술을 한눈에 비교하고
          최신 트렌드를 확인하세요
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-8">
          <div className="flex flex-col space-y-2 pb-6">
            <div className="w-12 h-12 rounded-lg bg-hanwha-primary/10 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-hanwha-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold leading-none tracking-tight text-hanwha-text-primary">
              솔루션 비교
            </h3>
            <p className="text-hanwha-text-muted">
              기업별 스마트십 기술을 매트릭스 형태로 체계적 분석
            </p>
          </div>
          <div className="space-y-4">
            <p className="text-hanwha-text-secondary leading-relaxed">
              HD현대, 삼성중공업, 콩스버그, 한국선급, DNV 등 주요 기업들의
              자율운항, 디지털트윈, 스마트선박 기술을 종합적으로 분석하고 비교합니다.
            </p>
            <a
              href="/comparison"
              className="inline-flex items-center justify-center rounded-lg text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-2 border-hanwha-primary text-hanwha-primary bg-background hover:bg-hanwha-primary hover:text-white h-12 px-6 py-3"
            >
              솔루션 비교 보기
            </a>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-8">
          <div className="flex flex-col space-y-2 pb-6">
            <div className="w-12 h-12 rounded-lg bg-hanwha-primary/10 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-hanwha-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold leading-none tracking-tight text-hanwha-text-primary">
              기술 현황
            </h3>
            <p className="text-hanwha-text-muted">
              기술 정보의 체계적 관리 및 데이터베이스 운영
            </p>
          </div>
          <div className="space-y-4">
            <p className="text-hanwha-text-secondary leading-relaxed">
              각 기술의 상세 정보, 사양, 특징, 관련 링크 등을
              전문적으로 관리하고 지속적으로 업데이트합니다.
            </p>
            <a
              href="/management"
              className="inline-flex items-center justify-center rounded-lg text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-2 border-hanwha-primary text-hanwha-primary bg-background hover:bg-hanwha-primary hover:text-white h-12 px-6 py-3"
            >
              기술 현황 보기
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}
