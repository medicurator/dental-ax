# dental-ax

치과 AX 강의에서 쓰는 Claude Code 플러그인과 mod, 그리고 따라 할 수 있는 안내서를 모아 둔 저장소입니다.

## 설치할 것

| 이름 | 하는 일 | 안내 |
|---|---|---|
| `usage-band` | Claude Code 입력창 위에 현재 모델, 컨텍스트 사용 비율, 5시간·7일 사용 한도를 막대로 보여 줍니다 | [설치 안내](plugins/usage-band/README.md) |

## 읽을 것

| 안내서 | 내용 |
|---|---|
| [Claude Code와 옵시디언으로 개인 위키 만들기](guides/llm-wiki.md) | 세션이 끝나면 사라지는 대화를 "위키에 추가해줘" 한마디로 옵시디언 문서로 남기는 구조를 6단계로 만듭니다. 규칙 파일과 스킬 3개의 내용이 들어 있습니다 |

## 설치 방법 (공통)

터미널(Windows는 PowerShell)에서 한 줄을 실행하고 Claude Code를 다시 시작합니다. `usage-band` 자리에 설치할 이름을 넣습니다.

```bash
claude plugin install usage-band --marketplace medicurator/dental-ax
```

여러 개를 설치할 때는 저장소를 한 번 등록해 두면 이름만으로 설치할 수 있습니다.

```bash
claude plugin marketplace add medicurator/dental-ax
claude plugin install usage-band@dental-ax
```

## 준비물

- Claude Code 최신 버전
- 터미널에서 `claude` 명령을 쓸 수 있는 상태
- Git (저장소를 내려받는 데 쓰입니다)

## 업데이트

```bash
claude plugin marketplace update dental-ax
claude plugin update usage-band@dental-ax
```

## 제거

```bash
claude plugin uninstall usage-band@dental-ax
```

## 폴더 구조

```
dental-ax/
├─ .claude-plugin/marketplace.json   # 이 저장소에 들어 있는 플러그인 목록
├─ plugins/
│  └─ usage-band/                    # 플러그인 하나가 폴더 하나
└─ guides/
   └─ llm-wiki.md                    # 읽을 자료
```
