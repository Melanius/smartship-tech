export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          스마트십 기술 비교
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          주요 조선사와 기술 기업들의 스마트십 기술을 한눈에 비교하고
          최신 트렌드를 확인하세요
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-col space-y-1.5 pb-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">
              🔍 기술 비교
            </h3>
            <p className="text-sm text-muted-foreground">
              기업별 스마트십 기술을 매트릭스 형태로 비교
            </p>
          </div>
          <div className="space-y-4">
            <p className="text-sm">
              HD현대, 삼성중공업, 콩스버그, 한국선급, DNV 등 주요 기업들의
              자율운항, 디지털트윈, 스마트선박 기술을 한눈에 확인할 수 있습니다.
            </p>
            <a
              href="/comparison"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              기술 비교 보기
            </a>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-col space-y-1.5 pb-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">
              ⚙️ 기능 관리
            </h3>
            <p className="text-sm text-muted-foreground">
              기술 정보를 상세하게 관리하고 편집
            </p>
          </div>
          <div className="space-y-4">
            <p className="text-sm">
              각 기술의 상세 정보, 사양, 특징, 관련 링크 등을
              체계적으로 관리할 수 있습니다.
            </p>
            <a
              href="/management"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              기능 관리 보기
            </a>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-muted/50 p-6">
        <h2 className="text-xl font-semibold mb-4">주요 기능</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <div className="font-medium">📊 실시간 비교</div>
            <p className="text-sm text-muted-foreground">
              기업별 기술을 실시간으로 비교하고 분석
            </p>
          </div>
          <div className="space-y-2">
            <div className="font-medium">🔐 관리자 시스템</div>
            <p className="text-sm text-muted-foreground">
              코드 기반 간편 인증과 변경 이력 추적
            </p>
          </div>
          <div className="space-y-2">
            <div className="font-medium">📱 반응형 디자인</div>
            <p className="text-sm text-muted-foreground">
              모바일과 데스크톱에서 최적화된 경험
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
