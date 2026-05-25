import type { Question, QuestionId } from '../model/types';

// TODO: 옵션별 캐릭터 매핑 (option.id → characterId)
const Q1: Question = {
  id: 'q1',
  title: '팀 프로젝트가 막혔을 때,\n나는 가장 먼저 무엇을 하나요?',
  subtitle: '정답은 없어요. 먼저 떠오르는 행동을 골라주세요.',
  options: [
    {
      id: 'leader',
      title: '“방향을 다시 잡자”',
      description: '팀을 모아 목표를 재정렬 하고 다음 스텝을 정한다',
    },
    {
      id: 'spark',
      title: '“일단 아이디어 뿌려보자”',
      description: '새로운 돌파구를 찾기 위해 브레인스토밍을 한다',
    },
    {
      id: 'builder',
      title: '“해왔던 것부터 마무리”',
      description: '지금까지 한 것을 완수한 뒤 다음을 생각한다',
    },
    {
      id: 'burner',
      title: '“왜 막혔는지 분석해보자”',
      description: '원인을 먼저 파악하고 논리적인 해결책을 설계한다',
    },
    {
      id: 'free',
      title: '“혼자 조용히 풀어본다”',
      description: '개인 시간을 갖고 자유롭게 접근법을 탐색한다',
    },
    {
      id: 'care',
      title: '“팀 분위기부터 챙긴다”',
      description: '지친 팀원들을 먼저 살피고 감정을 회복시킨다',
    },
  ],
};

const Q2: Question = {
  id: 'q2',
  title: '함께한 팀원들이 나를\n어떻게 기억할 것 같나요?',
  subtitle: '내가 가장 가깝다고 느끼는 문장을 골라주세요.',
  options: [
    {
      id: 'leader',
      title: '"흔들릴 때 중심 잡아준 사람"',
      description: '팀이 방향을 잃었을 때 기댈 수 있는 기준점',
    },
    {
      id: 'spark',
      title: '"분위기를 확 바꿔주던 사람"',
      description: '지루할 때 갑자기 스파크를 일으키는 촉매',
    },
    {
      id: 'builder',
      title: '"묵묵히 제일 많이 해낸 사람"',
      description: '뒤에서 조용히 팀의 완성도를 올려주는 존재',
    },
    {
      id: 'burner',
      title: '"막히면 답 가져오던 사람"',
      description: '어떤 문제든 논리적 해결책을 찾아오는 믿음',
    },
    {
      id: 'free',
      title: '"예상 못한 방식으로 푼 사람"',
      description: '다른 사람이 보지 못한 길을 발견하는 시야',
    },
    {
      id: 'care',
      title: '"지칠 때 옆에 있어준 사람"',
      description: '힘든 순간 멘탈을 지켜주는 팀의 정서적 기둥',
    },
  ],
};

export const QUESTIONS: Record<QuestionId, Question> = {
  q1: Q1,
  q2: Q2,
};
