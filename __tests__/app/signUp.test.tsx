//npm test __tests__/app/signUp.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUp from '@/app/signup/page';
import '@testing-library/jest-dom';

// Mock useRouter
const pushMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe('SignUp Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    Storage.prototype.setItem = jest.fn();
  });

  test('初始畫面：按鈕應為 disabled', () => {
    render(<SignUp />);
    const button = screen.getByRole('button', { name: '下一步' });
    expect(button).toBeDisabled();
  });

  test('填入符合規則的密碼但未填完其他欄位，應不觸發錯誤訊息', async () => {
    render(<SignUp />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('英文大小寫＋數字 至少長度8字'), 'Aa123456');

    const button = screen.getByRole('button', { name: '下一步' });
    expect(button).toBeDisabled();

    expect(
      screen.queryByText('密碼需包含英文大小寫與數字，且至少8字')
    ).not.toBeInTheDocument();
  });

  test('密碼不合規則時應顯示錯誤訊息（全數字）', async () => {
    render(<SignUp />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('請輸入本名'), 'Mary');
    await user.click(screen.getByLabelText('不透露'));
    await user.type(screen.getByPlaceholderText('請輸入電子郵件'), 'mary@test.com');
    await user.type(screen.getByPlaceholderText('英文大小寫＋數字 至少長度8字'), '12345678');

    await user.click(screen.getByRole('button', { name: '下一步' }));

    expect(
      screen.getByText('密碼需包含英文大小寫與數字，且至少8字')
    ).toBeInTheDocument();

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('密碼不合規則時應顯示錯誤訊息（無數字）', async () => {
    render(<SignUp />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('請輸入本名'), 'Mary');
    await user.click(screen.getByLabelText('不透露'));
    await user.type(screen.getByPlaceholderText('請輸入電子郵件'), 'mary2@test.com');
    await user.type(screen.getByPlaceholderText('英文大小寫＋數字 至少長度8字'), 'AaBbCcDd');

    await user.click(screen.getByRole('button', { name: '下一步' }));

    expect(
      screen.getByText('密碼需包含英文大小寫與數字，且至少8字')
    ).toBeInTheDocument();

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('輸入錯誤密碼後修正應清除錯誤訊息（觸發 setPasswordError("")）', async () => {
    render(<SignUp />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('請輸入本名'), 'Joe');
    await user.click(screen.getByLabelText('生理男'));
    await user.type(screen.getByPlaceholderText('請輸入電子郵件'), 'joe@test.com');
    await user.type(screen.getByPlaceholderText('英文大小寫＋數字 至少長度8字'), '12345678');

    await user.click(screen.getByRole('button', { name: '下一步' }));

    expect(
      screen.getByText('密碼需包含英文大小寫與數字，且至少8字')
    ).toBeInTheDocument();

    await user.clear(screen.getByPlaceholderText('英文大小寫＋數字 至少長度8字'));
    await user.type(screen.getByPlaceholderText('英文大小寫＋數字 至少長度8字'), 'Aa123456');

    await waitFor(() => {
      expect(
        screen.queryByText('密碼需包含英文大小寫與數字，且至少8字')
      ).not.toBeInTheDocument();
    });
  });

  test('填入有效資料後可以提交並跳轉頁面', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ uid: 'mock-uid' }),
    });

    render(<SignUp />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('請輸入本名'), 'Mary');
    await user.click(screen.getByLabelText('生理女'));
    await user.type(screen.getByPlaceholderText('請輸入電子郵件'), 'mary@test.com');
    await user.type(screen.getByPlaceholderText('英文大小寫＋數字 至少長度8字'), 'Aa123456');

    await user.click(screen.getByRole('button', { name: '下一步' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith('/signup/step2');
    });
  });

  test('輸入完全正確資料後，能順利通過密碼驗證邏輯（覆蓋 false 分支）', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ uid: 'uid-success' }),
    });

    render(<SignUp />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('請輸入本名'), 'Tom');
    await user.click(screen.getByLabelText('不透露'));
    await user.type(screen.getByPlaceholderText('請輸入電子郵件'), 'tom@pass.com');
    await user.type(screen.getByPlaceholderText('英文大小寫＋數字 至少長度8字'), 'Aa123456');

    await user.click(screen.getByRole('button', { name: '下一步' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  test('若信箱已被註冊，應顯示 emailError 訊息', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ errCode: 'email-exists' }),
    });

    render(<SignUp />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('請輸入本名'), 'Amy');
    await user.click(screen.getByLabelText('生理男'));
    await user.type(screen.getByPlaceholderText('請輸入電子郵件'), 'amy@test.com');
    await user.type(screen.getByPlaceholderText('英文大小寫＋數字 至少長度8字'), 'Aa123456');

    await user.click(screen.getByRole('button', { name: '下一步' }));

    await waitFor(() => {
      expect(
        screen.getByText('此信箱已註冊，請使用其他信箱')
      ).toBeInTheDocument();
    });
  });

  test('API 回傳未知錯誤時應跳出 alert', async () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: '資料庫炸掉了' }),
    });

    render(<SignUp />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('請輸入本名'), 'Lucy');
    await user.click(screen.getByLabelText('生理女'));
    await user.type(screen.getByPlaceholderText('請輸入電子郵件'), 'lucy@test.com');
    await user.type(screen.getByPlaceholderText('英文大小寫＋數字 至少長度8字'), 'Aa123456');

    await user.click(screen.getByRole('button', { name: '下一步' }));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('資料庫炸掉了');
    });

    alertMock.mockRestore();
  });
  test('API 回傳錯誤但無 error 欄位時應顯示預設 alert 訊息', async () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
  
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });
  
    render(<SignUp />);
    const user = userEvent.setup();
  
    await user.type(screen.getByPlaceholderText('請輸入本名'), 'Kate');
    await user.click(screen.getByLabelText('不透露'));
    await user.type(screen.getByPlaceholderText('請輸入電子郵件'), 'kate@test.com');
    await user.type(screen.getByPlaceholderText('英文大小寫＋數字 至少長度8字'), 'Aa123456');
  
    await user.click(screen.getByRole('button', { name: '下一步' }));
  
    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('註冊失敗');
    });
  
    alertMock.mockRestore();
  });  
});
