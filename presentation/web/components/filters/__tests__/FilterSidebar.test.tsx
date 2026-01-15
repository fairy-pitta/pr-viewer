import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterSidebar } from '../FilterSidebar';

describe('FilterSidebar', () => {
  it('should render filter inputs', () => {
    render(<FilterSidebar />);

    expect(screen.getByLabelText('リポジトリ')).toBeInTheDocument();
    expect(screen.getByLabelText('状態')).toBeInTheDocument();
    expect(screen.getByLabelText('担当者')).toBeInTheDocument();
    expect(screen.getByLabelText('検索')).toBeInTheDocument();
  });

  it('should call onFilterChange when filter values change', async () => {
    const user = userEvent.setup();
    const onFilterChange = jest.fn();

    render(<FilterSidebar onFilterChange={onFilterChange} />);

    const repositoryInput = screen.getByLabelText('リポジトリ');
    await user.type(repositoryInput, 'owner/repo');

    expect(onFilterChange).toHaveBeenCalled();
  });

  it('should update select value', async () => {
    const user = userEvent.setup();
    render(<FilterSidebar />);

    const statusSelect = screen.getByLabelText('状態') as HTMLSelectElement;
    await user.selectOptions(statusSelect, 'open');

    expect(statusSelect.value).toBe('open');
  });

  it('should update input values', async () => {
    const user = userEvent.setup();
    render(<FilterSidebar />);

    // placeholderで検索
    const searchInput = screen.getByPlaceholderText('タイトル、説明...') as HTMLInputElement;
    await user.type(searchInput, 'test query');

    expect(searchInput.value).toBe('test query');
  });
});
