function generateTimestampEmail() {
  const now = new Date();
  const YYYY = now.getFullYear();
  const MM = String(now.getMonth() + 1).padStart(2, '0');
  const DD = String(now.getDate()).padStart(2, '0');
  const HH = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${YYYY}${MM}${DD}${HH}${mm}${ss}@example.com`;
}

describe('完整流程：註冊 → 登入 → 點擊專案卡片 → 媒合', () => {
  const email = generateTimestampEmail();
  const password = 'Test1234';

  it('註冊帳號（Step1 + Step2）', () => {
    cy.visit('http://localhost:3000/signup');

    cy.get('input[name="name"]').type('Test User');
    cy.get('input[name="gender"][value="male"]').check();
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();

    cy.url({ timeout: 30000 }).should('include', '/signup/step2');

    cy.get('input[name="nickname"]').type('CypressNick');
    cy.get('input[name="userCommunity"]').type('https://github.com/tester');
    cy.get('textarea[name="bio"]').type('這是使用 Cypress 測試的簡介。');
    cy.get('input[name="user_pf_url"]').type('https://portfolio.com/tester');
    cy.get('button[type="submit"]').click();

    cy.contains('已完成註冊！', { timeout: 10000 }).should('be.visible');
  });

  it('登入後點擊專案卡片並跳轉到詳細頁', () => {
    cy.visit('http://localhost:3000/login');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();

    cy.url({ timeout: 10000 }).should('eq', 'http://localhost:3000/');

    cy.contains('h3', 'FoodHero', { timeout: 10000 }).should('be.visible').click();

    cy.url({ timeout: 20000 }).should('include', '/projects/');

    cy.contains('button', '加入媒合', { timeout: 10000 }).should('be.visible').click();

    cy.contains('確定要申請媒合嗎？', { timeout: 20000 }).should('be.visible');
    cy.contains('button', '媒合').click();

    cy.get('button').contains('已加入媒合', { timeout: 10000 })
      .should('be.visible')
      .and('have.attr', 'disabled');
  });
});
