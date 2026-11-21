# usage-band 설치 안내

Claude Code 입력창 위에 사용량을 한 줄로 보여 주는 mod입니다. 지금 쓰는 모델, 대화가 컨텍스트 창을 얼마나 채웠는지, 5시간·7일 사용 한도가 얼마나 찼는지를 막대로 표시합니다.

```
◆ Fable 5.2  ████░░░░  45% Context 90k/200k  ██░░░░░░  23% 5h Reset 15:30  █░░░░░░░   8% 7d
```

| 표시 | 뜻 |
|---|---|
| `◆ Fable 5.2` | 지금 세션이 쓰는 모델 |
| `Context` | 이 대화가 컨텍스트 창을 채운 비율과 토큰 수 |
| `5h` | 5시간 사용 한도를 쓴 비율. `Reset 15:30`은 한도가 다시 열리는 시각 |
| `7d` | 7일 사용 한도를 쓴 비율 |

85%를 넘은 항목은 빨간색으로 바뀝니다.

## 준비물

- **Claude Code**: 최신 버전. 이 mod는 Windows 11의 Claude Code 2.1.325에서 확인했습니다. 오래된 버전에서는 mod가 동작하지 않을 수 있습니다.
- **구독 계정**: `5h`, `7d` 막대는 Pro나 Max 같은 구독 계정에서만 나옵니다. API 키로 쓰는 경우에는 모델과 `Context`만 보입니다.
- **터미널**: 설치 명령을 입력할 PowerShell(Windows) 또는 터미널(Mac). `claude` 명령과 Git이 설치돼 있어야 합니다.

## 설치

### 1. 터미널에서 한 줄을 실행합니다

```bash
claude plugin install usage-band --marketplace medicurator/dental-ax
```

`✔ Successfully installed ...`로 시작하는 줄이 나오면 설치된 것입니다.

### 2. Claude Code를 다시 시작합니다

열려 있는 Claude Code 세션을 닫고 새로 엽니다. 입력창 위에 사용량 줄이 보이면 끝입니다. 첫 응답을 받기 전에는 `Context window ...` 안내만 보이고, 한 번 대화를 주고받으면 막대가 나옵니다.

## 업데이트

새 버전이 올라왔을 때 아래 두 줄을 실행하고 Claude Code를 다시 시작합니다.

```bash
claude plugin marketplace update dental-ax
claude plugin update usage-band@dental-ax
```

## 제거

```bash
claude plugin uninstall usage-band@dental-ax
```

## 문제가 있을 때

| 증상 | 확인할 것 |
|---|---|
| `claude`를 찾을 수 없다고 나온다 | Claude Code가 설치돼 있는지, 터미널을 새로 열었는지 확인합니다 |
| 설치 중 `git` 관련 오류가 난다 | Git이 설치돼 있는지 확인합니다 |
| 설치는 됐는데 줄이 안 보인다 | Claude Code를 완전히 닫고 다시 엽니다. 그래도 안 보이면 Claude Code를 최신 버전으로 올립니다 |
| `5h`, `7d`가 안 보인다 | 구독 계정으로 로그인했는지 확인합니다. 첫 응답을 받은 뒤에 나타납니다 |
| 모델 이름이 바로 안 바뀐다 | 모델을 바꾼 뒤 다음 응답이 끝나면 바뀝니다 |

설치 상태는 `claude plugin list`로 볼 수 있습니다.

## 알아둘 점

- 이 mod는 화면에 숫자를 보여 주기만 합니다. 대화 내용을 읽거나 외부로 보내지 않습니다.
- 한도 숫자는 Claude Code가 알려 주는 값을 그대로 표시합니다. 모델별로 따로 있는 한도는 Claude Code가 mod에 알려 주지 않아 표시하지 못합니다.
- `Reset` 시각은 이 컴퓨터의 현지 시각입니다.

버전 0.18.0
