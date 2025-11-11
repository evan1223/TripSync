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
const dynamicEmail = generateTimestampEmail();

describe('Signup Page Step 1', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/signup', { timeout: 20000 });
    cy.wait(1000);
  });

  it('should fill and submit Step 1 successfully', () => {
    cy.get('input[name="name"]', { timeout: 10000 }).type('Test User');
    cy.get('input[name="gender"][value="male"]', { timeout: 10000 }).check();
    cy.get('input[name="email"]', { timeout: 10000 }).type(dynamicEmail);
    cy.get('input[name="password"]', { timeout: 10000 }).type('Test1234');

    cy.get('button[type="submit"]', { timeout: 10000 }).click();
    cy.wait(2000); 
    cy.url({ timeout: 20000 }).should('include', '/signup/step2');
  });

  it('should show error if password is invalid', () => {
    cy.get('input[name="name"]', { timeout: 10000 }).type('Test User');
    cy.get('input[name="gender"][value="male"]', { timeout: 10000 }).check();
    cy.get('input[name="email"]', { timeout: 10000 }).type('test6@example.com');
    cy.get('input[name="password"]', { timeout: 10000 }).type('abc');

    cy.get('button[type="submit"]', { timeout: 10000 }).click();
    cy.wait(1000);
    cy.contains('密碼需包含英文大小寫與數字，且至少8字').should('be.visible');
  });
});

describe('Signup Page Step 2', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/signup/step2', { onBeforeLoad(win) {
      win.localStorage.setItem('uid', 'mock-uid');
    }, timeout: 20000 });
    cy.wait(1000); 
  });

  it('should submit Step 2 and show modal', () => {
    cy.get('input[name="nickname"]', { timeout: 10000 }).type('CypressNick');
    cy.get('input[name="userCommunity"]', { timeout: 10000 }).type('https://github.com/tester');
    cy.get('textarea[name="bio"]', { timeout: 10000 }).type('這是使用 Cypress 測試的簡介。');
    cy.get('input[name="user_pf_url"]', { timeout: 10000 }).type('https://portfolio.com/tester');

    cy.wait(500);
    cy.get('button[type="submit"]', { timeout: 10000 }).click();
  });
});
