DROP TABLE IF EXISTS comments,products,users;

CREATE TABLE users
(
  userId int NOT NULL,
  userName varchar(31) NOT NULL UNIQUE,
  PRIMARY KEY (userId)
);
INSERT INTO users VALUES (639,'Mrs. Peacock');
INSERT INTO users VALUES (2367,'Miss Scarlet');
INSERT INTO users VALUES (43,'Mr. Boddy');
INSERT INTO users VALUES (1867,'Professor Plum');
INSERT INTO users VALUES (543,'Colonel Mustard');
INSERT INTO users VALUES (1235,'Mrs. White');

CREATE TABLE products
(
  productId int NOT NULL,
  productName varchar(255) NOT NULL,
  logoUrl varchar(255) NOT NULL,
  version varchar(63) NOT NULL,
  lastUpdate int NOT NULL,
  userId int NOT NULL,
  PRIMARY KEY (productId),
  FOREIGN KEY (userId) REFERENCES users(userId)
);
INSERT INTO products VALUES (55,'AAAA','www.url.com/AAAA.png','1.0',1453447298,639);
INSERT INTO products VALUES (33,'AAAB','www.url.com/AAAB.png','1.3',1453147298,639);
INSERT INTO products VALUES (44,'AAAC','www.url.com/AAAC.png','1.0',1453347298,2367);
INSERT INTO products VALUES (54321,'AAAD','www.url.com/Default.png','2.3',1453444298,43);
INSERT INTO products VALUES (12345,'AAAE','www.url.com/Default.png','3.5',1453441298,43);
INSERT INTO products VALUES (2222,'AAAF','www.url.com/Default.png','5.5',1443447298,543);

CREATE TABLE comments
(
  commentId int NOT NULL,
  commentBody varchar(1023) NOT NULL,
  commentTime int NOT NULL,
  productId int NOT NULL,
  userId int NOT NULL,
  PRIMARY KEY (commentId),
  FOREIGN KEY (productId) REFERENCES products(productId),
  FOREIGN KEY (userId) REFERENCES users(userId)
);
INSERT INTO comments VALUES (101,'FIRST',1453447868,55,543);
INSERT INTO comments VALUES (102,'First!',1453447869,55,1867);
INSERT INTO comments VALUES (103,'Too slow professor',1453458357,55,543);
