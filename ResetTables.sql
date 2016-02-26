DROP TABLE IF EXISTS comments,products,users,tags,productTags;

CREATE TABLE users
(
  userId int NOT NULL AUTO_INCREMENT,
  email varchar(255) NOT NULL,
  username varchar(31) NOT NULL,
  profileImageUrl varchar(255) NOT NULL,
  bio varchar(511),
  PRIMARY KEY (userId)
);
INSERT INTO users (email,username,profileImageUrl,bio) VALUES ('dont@care.org','Mrs. Peacock','www.no.com/img.jpg','Not now');
INSERT INTO users (email,username,profileImageUrl,bio) VALUES ('dont@care.org','Miss Scarlet','www.no.com/img.jpg','Not now');
INSERT INTO users (email,username,profileImageUrl,bio) VALUES ('dont@care.org','Mr. Black','www.no.com/img.jpg','Not now');
INSERT INTO users (email,username,profileImageUrl,bio) VALUES ('dont@care.org','Professor Plum','www.no.com/img.jpg','Not now');
INSERT INTO users (email,username,profileImageUrl,bio) VALUES ('dont@care.org','Colonel Mustard','www.no.com/img.jpg','Not now');
INSERT INTO users (email,username,profileImageUrl,bio) VALUES ('dont@care.org','Mrs. White','www.no.com/img.jpg','Not now');

CREATE TABLE products
(
  productId int NOT NULL AUTO_INCREMENT,
  productName varchar(255) NOT NULL,
  logoUrl varchar(255) NOT NULL,
  version varchar(63) NOT NULL,
  lastUpdate DATE NOT NULL,
  userId int NOT NULL,
  uploadDate DATE NOT NULL,
  description varchar(4000),
  overallRate double,
  learnability double,
  easeOfUse double,
  compatibility double,
  documentation double,
  PRIMARY KEY (productId),
  FOREIGN KEY (userId) REFERENCES users(userId)
);
INSERT INTO products (productName, logoUrl, version, lastUpdate, userId, overallRate,learnability,easeOfUse,compatibility,documentation,description, uploadDate) VALUES ('MAMP','https://pbs.twimg.com/profile_images/440835187933339648/J0eyUcj6.png','1.0','2015-10-01',1,1.3,5.6,9,3.4,7.5, 'MAMP installs a local server environment in a matter of seconds on your computer. It comes free of charge, and is easily installed. MAMP will not compromise any existing Apache installation already running on your system. You can install Apache, PHP and MySQL without starting a script or having to change any configuration files! Furthermore, if MAMP is no longer needed, just delete the MAMP folder and everything returns to its original state (i.e. MAMP does not modify any of the "normal" system).Similar to a Linux-Distribution, MAMP is a combination of free software and thus it is offered free of charge. MAMP is released under the GNU General Public License and may thereby be distributed freely within the boundaries of this license. Please note: some of the included software is released using a different license. In these cases, the corresponding license applies.',NOW());
INSERT INTO products (productName, logoUrl, version, lastUpdate, userId, overallRate,learnability,easeOfUse,compatibility,documentation,description, uploadDate) VALUES ('MAMP','https://pbs.twimg.com/profile_images/440835187933339648/J0eyUcj6.png','2.0','2015-10-01',1,1.3,5.6,9,3.4,7.5, 'MAMP installs a local server environment in a matter of seconds on your computer. It comes free of charge, and is easily installed. MAMP will not compromise any existing Apache installation already running on your system. You can install Apache, PHP and MySQL without starting a script or having to change any configuration files! Furthermore, if MAMP is no longer needed, just delete the MAMP folder and everything returns to its original state (i.e. MAMP does not modify any of the "normal" system).Similar to a Linux-Distribution, MAMP is a combination of free software and thus it is offered free of charge. MAMP is released under the GNU General Public License and may thereby be distributed freely within the boundaries of this license. Please note: some of the included software is released using a different license. In these cases, the corresponding license applies.',NOW());
INSERT INTO products (productName, logoUrl, version, lastUpdate, userId, overallRate,learnability,easeOfUse,compatibility,documentation,description, uploadDate) VALUES ('MAMP','https://pbs.twimg.com/profile_images/440835187933339648/J0eyUcj6.png','3.0','2015-10-01',1,1.3,5.6,9,3.4,7.5, 'MAMP installs a local server environment in a matter of seconds on your computer. It comes free of charge, and is easily installed. MAMP will not compromise any existing Apache installation already running on your system. You can install Apache, PHP and MySQL without starting a script or having to change any configuration files! Furthermore, if MAMP is no longer needed, just delete the MAMP folder and everything returns to its original state (i.e. MAMP does not modify any of the "normal" system).Similar to a Linux-Distribution, MAMP is a combination of free software and thus it is offered free of charge. MAMP is released under the GNU General Public License and may thereby be distributed freely within the boundaries of this license. Please note: some of the included software is released using a different license. In these cases, the corresponding license applies.',NOW());
INSERT INTO products (productName, logoUrl, version, lastUpdate, userId, uploadDate) VALUES ('AAAB','https://pbs.twimg.com/profile_images/440835187933339648/J0eyUcj6.png','1.3','2015-08-15',1,NOW());
INSERT INTO products (productName, logoUrl, version, lastUpdate, userId, uploadDate) VALUES ('AAAC','https://pbs.twimg.com/profile_images/440835187933339648/J0eyUcj6.png','1.0','2015-10-17',4,NOW());
INSERT INTO products (productName, logoUrl, version, lastUpdate, userId, uploadDate) VALUES ('AAAD','https://pbs.twimg.com/profile_images/440835187933339648/J0eyUcj6.png','2.3','2015-10-12',3,NOW());
INSERT INTO products (productName, logoUrl, version, lastUpdate, userId, uploadDate) VALUES ('AAAE','https://pbs.twimg.com/profile_images/440835187933339648/J0eyUcj6.png','3.5','2015-06-11',5,NOW());
INSERT INTO products (productName, logoUrl, version, lastUpdate, userId, uploadDate) VALUES ('AAAF','https://pbs.twimg.com/profile_images/440835187933339648/J0eyUcj6.png','5.5','2015-11-10',4,NOW());

CREATE TABLE comments
(
  commentId int NOT NULL AUTO_INCREMENT,
  commentBody varchar(1023) NOT NULL,
  commentTime DATETIME NOT NULL,
  productId int NOT NULL,
  userId int NOT NULL,
  overallRate int NOT NULL,
  learnability int NOT NULL,
  easeOfUse int NOT NULL,
  compatibility int NOT NULL,
  documentation int NOT NULL,
  PRIMARY KEY (commentId),
  FOREIGN KEY (productId) REFERENCES products(productId),
  FOREIGN KEY (userId) REFERENCES users(userId)
);
INSERT INTO comments (commentBody, commentTime, productId, userId) VALUES ('FIRST','2015-10-01 10:09:30',1,1);
INSERT INTO comments (commentBody, commentTime, productId, userId) VALUES ('First!','2015-10-01 10:09:31',1,4);
INSERT INTO comments (commentBody, commentTime, productId, userId) VALUES ('Too slow professor','2015-10-01 10:09:50',1,1);

CREATE TABLE tags
(
    tagId int NOT NULL AUTO_INCREMENT,
    tag varchar(25) NOT NULL,
    PRIMARY KEY (tagId)
);
INSERT INTO tags (tag) VALUES ('Web Server');
INSERT INTO tags (tag) VALUES ('JavaScript');
INSERT INTO tags (tag) VALUES ('Java');
INSERT INTO tags (tag) VALUES ('C');
INSERT INTO tags (tag) VALUES ('PHP');
INSERT INTO tags (tag) VALUES ('Web Framework');
INSERT INTO tags (tag) VALUES ('JavaScript Framework');
INSERT INTO tags (tag) VALUES ('Windows');
INSERT INTO tags (tag) VALUES ('Linux');
INSERT INTO tags (tag) VALUES ('OSX');
INSERT INTO tags (tag) VALUES ('Android');
INSERT INTO tags (tag) VALUES ('iOS');
INSERT INTO tags (tag) VALUES ('Database');
INSERT INTO tags (tag) VALUES ('Operating System');
INSERT INTO tags (tag) VALUES ('Library');
INSERT INTO tags (tag) VALUES ('Framework');
INSERT INTO tags (tag) VALUES ('Python');
INSERT INTO tags (tag) VALUES ('Cryptography');
INSERT INTO tags (tag) VALUES ('Security');

CREATE TABLE productTags
(
    productId int NOT NULL,
    tagId int NOT NULL,
    PRIMARY KEY (productId, tagId),
    FOREIGN KEY (productId) REFERENCES products(productId),
    FOREIGN KEY (tagId) REFERENCES tags(tagId)
);
INSERT INTO productTags (productId, tagId) VALUES (1,1);
INSERT INTO productTags (productId, tagId) VALUES (1,5);
INSERT INTO productTags (productId, tagId) VALUES (1,6);
INSERT INTO productTags (productId, tagId) VALUES (2,1);
INSERT INTO productTags (productId, tagId) VALUES (2,5);
INSERT INTO productTags (productId, tagId) VALUES (2,6);
INSERT INTO productTags (productId, tagId) VALUES (3,1);
INSERT INTO productTags (productId, tagId) VALUES (3,5);
INSERT INTO productTags (productId, tagId) VALUES (3,6);

DELIMITER $$
DROP PROCEDURE IF EXISTS usp_insertTestData$$
CREATE PROCEDURE usp_insertTestData()
BEGIN
    DECLARE vcnt INT;
    DECLARE vtotal INT;

    SET vcnt = 0;
    SET vtotal = 1000;

    WHILE vcnt < vtotal DO
        INSERT INTO comments (commentBody, commentTime, productId, userId,overallRate,learnability,easeOfUse,compatibility,documentation) VALUES ('',NOW(),1,2, FLOOR(RAND() * 11), FLOOR(RAND() * 11), FLOOR(RAND() * 11), FLOOR(RAND() * 11), FLOOR(RAND() * 11) );
        set vcnt = vcnt + 1;
    END WHILE;

    SET vcnt = 0;
    SET vtotal = 1000;

    WHILE vcnt < vtotal DO
        INSERT INTO comments (commentBody, commentTime, productId, userId,overallRate,learnability,easeOfUse,compatibility,documentation) VALUES ('',NOW(),2,2, FLOOR(RAND() * 11), FLOOR(RAND() * 11), FLOOR(RAND() * 11), FLOOR(RAND() * 11), FLOOR(RAND() * 11) );
        set vcnt = vcnt + 1;
    END WHILE;

    SET vcnt = 0;
    SET vtotal = 1000;

    WHILE vcnt < vtotal DO
        INSERT INTO comments (commentBody, commentTime, productId, userId,overallRate,learnability,easeOfUse,compatibility,documentation) VALUES ('',NOW(),3,2, FLOOR(RAND() * 11), FLOOR(RAND() * 11), FLOOR(RAND() * 11), FLOOR(RAND() * 11), FLOOR(RAND() * 11) );
        set vcnt = vcnt + 1;
    END WHILE;
END
$$


DROP PROCEDURE IF EXISTS usp_updateProductStats$$
CREATE PROCEDURE usp_updateProductStats(IN pId INT)
BEGIN

    UPDATE products
    SET overallRate = (SELECT AVG(overallRate) FROM comments WHERE productId = pId),
        learnability = (SELECT AVG(learnability) FROM comments WHERE productId = pId),
        easeOfUse = (SELECT AVG(easeOfUse) FROM comments WHERE productId = pId),
        compatibility = (SELECT AVG(compatibility) FROM comments WHERE productId = pId),
        documentation = (SELECT AVG(documentation) FROM comments WHERE productId = pId)
    WHERE productId = pId;

END
$$

DELIMITER ;