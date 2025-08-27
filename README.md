# 긍정 에너지 발전소

학생이 입력한 단점을 긍정적인 확언(affirmation)으로 변환해주는 교육적 기능을 가진 웹 애플리케이션입니다.

## 기술 스택

-   **프론트엔드**: React, TypeScript, HTML5, CSS3
-   **백엔드**: Node.js (Serverless Function)
-   **AI**: Google Gemini API (`gemini-2.5-flash`)

## 배포 가이드

이 애플리케이션은 Vercel 또는 Netlify와 같은 최신 호스팅 플랫폼에 쉽게 배포할 수 있도록 구성되어 있습니다.

1.  **Git 저장소에 코드 푸시**:
    이 프로젝트 코드를 GitHub, GitLab 또는 Bitbucket 저장소에 푸시합니다.

2.  **호스팅 플랫폼에 프로젝트 생성**:
    -   [Vercel](https://vercel.com/) 또는 [Netlify](https://www.netlify.com/)에 로그인합니다.
    -   새 프로젝트를 만들고 이전 단계에서 생성한 Git 저장소를 연결합니다.

3.  **환경 변수 설정**:
    프로젝트 설정에서 다음 환경 변수를 추가해야 합니다.
    -   **`API_KEY`**: 여러분의 Google Gemini API 키를 값으로 설정합니다.

4.  **배포**:
    플랫폼이 자동으로 프로젝트를 빌드하고 배포합니다. 프레임워크 프리셋을 선택할 필요가 없을 수 있으며, 만약 선택해야 한다면 "Other" 또는 정적 사이트 관련 옵션을 선택하면 됩니다. API는 `api` 디렉토리 덕분에 자동으로 감지됩니다.

배포가 완료되면 고유한 URL로 애플리케이션에 접속할 수 있습니다.
