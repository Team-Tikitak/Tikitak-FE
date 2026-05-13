import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PhotoUploader, type UploaderPhoto } from './PhotoUploader';

const makePhotos = (count: number): UploaderPhoto[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `photo-${i}`,
    src: `/img-${i}.jpg`,
    alt: `사진 ${i}`,
  }));

describe('PhotoUploader', () => {
  it('업로드된 사진을 모두 렌더링한다', () => {
    render(<PhotoUploader photos={makePhotos(2)} max={5} onAdd={vi.fn()} onRemove={vi.fn()} />);

    expect(screen.getByAltText('사진 0')).toBeInTheDocument();
    expect(screen.getByAltText('사진 1')).toBeInTheDocument();
  });

  it('photos 개수가 max 보다 적으면 업로드 버튼을 보여준다', () => {
    render(<PhotoUploader photos={makePhotos(2)} max={5} onAdd={vi.fn()} onRemove={vi.fn()} />);

    expect(screen.getByLabelText('사진 추가 (2/5)')).toBeInTheDocument();
  });

  it('photos 개수가 max 와 같으면 업로드 버튼이 사라진다', () => {
    render(<PhotoUploader photos={makePhotos(5)} max={5} onAdd={vi.fn()} onRemove={vi.fn()} />);

    expect(screen.queryByLabelText(/사진 추가/)).not.toBeInTheDocument();
  });

  it('업로드 버튼 클릭은 onAdd 를 호출한다', () => {
    const onAdd = vi.fn();
    render(<PhotoUploader photos={makePhotos(1)} max={5} onAdd={onAdd} onRemove={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('사진 추가 (1/5)'));

    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('삭제 버튼 클릭은 onRemove 를 해당 사진 id 와 함께 호출한다', () => {
    const onRemove = vi.fn();
    render(<PhotoUploader photos={makePhotos(2)} max={5} onAdd={vi.fn()} onRemove={onRemove} />);

    const removeButtons = screen.getAllByLabelText('사진 삭제');
    fireEvent.click(removeButtons[1]);

    expect(onRemove).toHaveBeenCalledWith('photo-1');
  });
});
