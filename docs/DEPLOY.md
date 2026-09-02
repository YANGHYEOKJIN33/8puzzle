# 배포 안내 — GitHub Pages 켜기

요구사항 7.1에 따라 서버 없이 **GitHub Pages** 로 게시한다.
`main` 브랜치에 push하면 GitHub Actions가 자동으로 사이트를 올린다.

## 최초 1회 설정 (저장소 소유자가 직접)

1. GitHub 저장소 → **Settings** → 왼쪽 메뉴 **Pages**
2. **Build and deployment · Source** 를 **GitHub Actions** 로 바꾼다
   (`Deploy from a branch`가 아니다)
3. 저장한다

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
| Actions가 실패한다 | Settings → Pages의 Source가 **GitHub Actions**인지 |
| 화면이 하얗다 | 브라우저 개발자 도구 콘솔에서 모듈 경로 오류를 확인 |
| CSS가 안 먹는다 | 경로가 `./src/...` 형태의 상대 경로인지 (저장소 이름이 주소에 들어가므로 절대 경로 `/src/...`는 깨진다) |
| 파일이 안 올라간다 | 저장소 뿌리의 `.nojekyll` 파일이 있는지 |
