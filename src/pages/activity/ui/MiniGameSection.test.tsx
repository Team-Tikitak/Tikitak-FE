import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MiniGameSection } from './MiniGameSection';

vi.mock('@/shared/api/game/queries', () => ({
  useGameLeaderboard: () => ({ entries: [], isPending: false }),
}));

const storageKey = (gameId: string) => `tikitak:minigame-collapsed:${gameId}`;

const renderSection = () =>
  render(
    <MemoryRouter>
      <MiniGameSection teamId={1} myTeamMemberId={1} />
    </MemoryRouter>,
  );

const header = (title: string) => screen.getByRole('button', { name: title });

describe('MiniGameSection 카드 접기', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('모든 카드가 처음에는 펼쳐져 있다', () => {
    renderSection();

    for (const title of ['티키 날기', '탁 잡기', '티키타닥']) {
      expect(header(title)).toHaveAttribute('aria-expanded', 'true');
    }
  });

  it('섹션 제목은 접는 버튼이 아니다', () => {
    renderSection();

    expect(screen.queryByRole('button', { name: '미니게임' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '미니게임', level: 2 })).toBeInTheDocument();
  });

  it('카드 제목을 누르면 그 카드만 접히고 선택이 저장된다', () => {
    renderSection();

    fireEvent.click(header('탁 잡기'));

    expect(header('탁 잡기')).toHaveAttribute('aria-expanded', 'false');
    expect(header('티키 날기')).toHaveAttribute('aria-expanded', 'true');
    expect(header('티키타닥')).toHaveAttribute('aria-expanded', 'true');
    expect(window.localStorage.getItem(storageKey('whack'))).toBe('1');
    expect(window.localStorage.getItem(storageKey('flappy'))).toBeNull();

    // 접힌 카드의 내용은 보조기기와 키보드로 접근되지 않는다
    const content = document.getElementById(header('탁 잡기').getAttribute('aria-controls') ?? '');
    expect(content).toHaveAttribute('inert');
  });

  it('다시 누르면 펼쳐진다', () => {
    renderSection();

    fireEvent.click(header('티키 날기'));
    fireEvent.click(header('티키 날기'));

    expect(header('티키 날기')).toHaveAttribute('aria-expanded', 'true');
    expect(window.localStorage.getItem(storageKey('flappy'))).toBe('0');
  });

  it('게임마다 저장된 접힘 상태로 시작한다', () => {
    window.localStorage.setItem(storageKey('keycap'), '1');

    renderSection();

    expect(header('티키타닥')).toHaveAttribute('aria-expanded', 'false');
    expect(header('티키 날기')).toHaveAttribute('aria-expanded', 'true');
  });

  it('저장소를 쓸 수 없어도 오류 없이 펼친 채로 시작한다', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(() => renderSection()).not.toThrow();
    expect(header('티키 날기')).toHaveAttribute('aria-expanded', 'true');

    getItem.mockRestore();
  });
});
