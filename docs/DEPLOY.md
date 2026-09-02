# 배포 안내 — GitHub Pages 켜기

요구사항 7.1에 따라 서버 없이 **GitHub Pages** 로 게시한다.
`main` 브랜치에 push하면 GitHub Actions가 자동으로 사이트를 올린다.

## 최초 설정

워크플로의 `configure-pages` 단계에 `enablement: true`를 주었기 때문에,
**Pages가 꺼져 있어도 워크플로가 직접 켠다.** 보통은 따로 할 일이 없다.

조직 정책 등으로 워크플로가 Pages를 켜지 못하면 아래 오류가 난다.

```
Error: Get Pages site failed. Please verify that the repository has Pages
enabled and configured to build using GitHub Actions ...
Error: HttpError: Not Found
```

이때는 저장소 소유자가 한 번만 직접 켜 주면 된다.

1. GitHub 저장소 → **Settings** → 왼쪽 메뉴 **Pages**
2. **Build and deployment · Source** 를 **GitHub Actions** 로 바꾼다
   (`Deploy from a branch`가 아니다)
3. Actions 탭에서 실패한 워크플로를 **Re-run** 한다

이후 `main`에 push할 때마다 `.github/workflows/deploy.yml`이 실행되어 자동 배포된다.

## 사이트 주소

```
https://yanghyeokjin33.github.io/Alg/
```

## 수동으로 배포하고 싶을 때

저장소 → **Actions** → **Deploy to GitHub Pages** → **Run workflow**

## 배포가 안 될 때 확인할 것

| 증상 | 확인 |
|---|---|
| `Get Pages site failed ... Not Found` | 위 "최초 설정"의 수동 절차대로 Source를 **GitHub Actions**로 바꾼 뒤 Re-run |
| Actions가 실패한다 | Settings → Pages의 Source가 **GitHub Actions**인지 |
| 화면이 하얗다 | 브라우저 개발자 도구 콘솔에서 모듈 경로 오류를 확인 |
| CSS가 안 먹는다 | 경로가 `./src/...` 형태의 상대 경로인지 (저장소 이름이 주소에 들어가므로 절대 경로 `/src/...`는 깨진다) |
| 파일이 안 올라간다 | 저장소 뿌리의 `.nojekyll` 파일이 있는지 |

> `Node 20 is being deprecated ...` 는 오류가 아니라 안내 문구다.
> GitHub이 이미 Node 24로 실행하고 있으므로 그대로 두어도 배포에는 지장이 없다.
