DROP TABLE IF EXISTS comments,products,users;

CREATE TABLE users
(
  userId int NOT NULL AUTO_INCREMENT,
  userName varchar(31) NOT NULL UNIQUE,
  PRIMARY KEY (userId)
);
INSERT INTO users (userName) VALUES ('Mrs. Peacock');
INSERT INTO users (userName) VALUES ('Miss Scarlet');
INSERT INTO users (userName) VALUES ('Mr. Boddy');
INSERT INTO users (userName) VALUES ('Professor Plum');
INSERT INTO users (userName) VALUES ('Colonel Mustard');
INSERT INTO users (userName) VALUES ('Mrs. White');

CREATE TABLE products
(
  productId int NOT NULL AUTO_INCREMENT,
  productName varchar(255) NOT NULL,
  logoUrl varchar(255) NOT NULL,
  version varchar(63) NOT NULL,
  lastUpdate DATE NOT NULL,
  userId int NOT NULL,
  PRIMARY KEY (productId),
  FOREIGN KEY (userId) REFERENCES users(userId)
);
INSERT INTO products (productName, logoUrl, version, lastUpdate, userId) VALUES ('AAAA','www.url.com/AAAA.png','1.0','2015-10-01',1);
INSERT INTO products (productName, logoUrl, version, lastUpdate, userId) VALUES ('AAAB','www.url.com/AAAB.png','1.3','2015-08-15',1);
INSERT INTO products (productName, logoUrl, version, lastUpdate, userId) VALUES ('AAAC','www.url.com/AAAC.png','1.0','2015-10-17',4);
INSERT INTO products (productName, logoUrl, version, lastUpdate, userId) VALUES ('AAAD','www.url.com/Default.png','2.3','2015-10-12',3);
INSERT INTO products (productName, logoUrl, version, lastUpdate, userId) VALUES ('AAAE','www.url.com/Default.png','3.5','2015-06-11',5);
INSERT INTO products (productName, logoUrl, version, lastUpdate, userId) VALUES ('AAAF','www.url.com/Default.png','5.5','2015-11-10',4);

CREATE TABLE comments
(
  commentId int NOT NULL AUTO_INCREMENT,
  commentBody varchar(1023) NOT NULL,
  commentTime int NOT NULL,
  productId int NOT NULL,
  userId int NOT NULL,
  PRIMARY KEY (commentId),
  FOREIGN KEY (productId) REFERENCES products(productId),
  FOREIGN KEY (userId) REFERENCES users(userId)
);
INSERT INTO comments (commentBody, commentTime, productId, userId) VALUES ('FIRST',1453447868,2,1);
INSERT INTO comments (commentBody, commentTime, productId, userId) VALUES ('First!',1453447869,3,2);
INSERT INTO comments (commentBody, commentTime, productId, userId) VALUES ('Too slow professor',1453458357,2,4);
