describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/login');
  });

  it('should render login form', () => {
    cy.contains('帳號登入').should('be.visible');
    cy.get('input[name="email"]').should('exist');
    cy.get('input[name="password"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should fail login with invalid credentials', () => {
    cy.get('input[name="email"]').type('wronguser@example.com');
    cy.get('input[name="password"]').type('WrongPassword');
    cy.get('button[type="submit"]').click();

    cy.contains('無效的帳號或密碼').should('be.visible');
  });


  it('should require email and password fields', () => {
    cy.get('button[type="submit"]').should('be.disabled');
  });


  
  it('可以成功登入並跳轉到首頁', () => {
    cy.visit('http://localhost:3000/login');

    cy.get('input[name="email"]').type('test4@example.com');
    cy.get('input[name="password"]').type('Test1234');

    cy.get('button[type="submit"]').click();

    cy.url({ timeout: 10000 }).should('eq', 'http://localhost:3000/');
  });
});
