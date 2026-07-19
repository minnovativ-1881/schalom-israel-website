// =============================================
// Namensliste fuer den Zwischenspeicher.
// Haeufige deutsche Vornamen plus die biblischen, die bei dieser
// Leserschaft ueberproportional vorkommen duerften.
// =============================================
const NAMEN = [
  // Biblisch und hebraeisch (fuer diese Leserschaft am wichtigsten)
  'David', 'Sarah', 'Michael', 'Daniel', 'Hannah', 'Anna', 'Jonathan', 'Rebekka',
  'Rachel', 'Ruth', 'Esther', 'Miriam', 'Naomi', 'Lea', 'Rahel', 'Elisabeth',
  'Simon', 'Thomas', 'Johannes', 'Jakob', 'Josef', 'Joseph', 'Benjamin', 'Samuel',
  'Gabriel', 'Raphael', 'Elias', 'Noah', 'Adam', 'Eva', 'Abraham', 'Isaak',
  'Salomon', 'Judith', 'Deborah', 'Debora', 'Tamar', 'Aaron', 'Mose', 'Moses',
  'Levi', 'Jesaja', 'Jeremia', 'Hesekiel', 'Daniela', 'Susanne', 'Magdalena',
  'Martha', 'Marta', 'Maria', 'Josua', 'Nathan', 'Natan', 'Tobias', 'Matthias',
  'Andreas', 'Philipp', 'Jonas', 'Lukas', 'Markus', 'Paul', 'Petra', 'Peter',

  // Haeufige deutsche Vornamen, weiblich
  'Julia', 'Katharina', 'Christina', 'Stefanie', 'Nicole', 'Sabine', 'Claudia',
  'Andrea', 'Monika', 'Birgit', 'Karin', 'Ursula', 'Renate', 'Brigitte', 'Gabriele',
  'Angelika', 'Barbara', 'Heike', 'Kerstin', 'Silke', 'Petra', 'Martina', 'Bettina',
  'Melanie', 'Nadine', 'Jessica', 'Jennifer', 'Vanessa', 'Laura', 'Lisa', 'Marie',
  'Sophie', 'Sophia', 'Emma', 'Mia', 'Lena', 'Leonie', 'Johanna', 'Charlotte',
  'Amelie', 'Emilia', 'Clara', 'Klara', 'Luisa', 'Louisa', 'Ida', 'Frieda',
  'Helena', 'Isabel', 'Isabella', 'Carolin', 'Caroline', 'Franziska', 'Verena',
  'Simone', 'Tanja', 'Sandra', 'Manuela', 'Doris', 'Elke', 'Gisela', 'Ingrid',
  'Helga', 'Erika', 'Christa', 'Marion', 'Cornelia', 'Beate', 'Ulrike', 'Anja',
  'Alexandra', 'Kristin', 'Antje', 'Ilona', 'Rita', 'Bianca', 'Yvonne', 'Diana',

  // Haeufige deutsche Vornamen, maennlich
  'Alexander', 'Christian', 'Stefan', 'Sebastian', 'Florian', 'Martin', 'Frank',
  'Thorsten', 'Torsten', 'Dirk', 'Jens', 'Sven', 'Marco', 'Marcel', 'Patrick',
  'Dennis', 'Kevin', 'Nico', 'Tim', 'Tom', 'Jan', 'Lars', 'Nils', 'Ole',
  'Klaus', 'Wolfgang', 'Hans', 'Werner', 'Guenter', 'Guenther', 'Helmut',
  'Manfred', 'Dieter', 'Juergen', 'Bernd', 'Uwe', 'Rainer', 'Reiner', 'Norbert',
  'Ralf', 'Ralph', 'Holger', 'Detlef', 'Volker', 'Joachim', 'Wilhelm', 'Heinrich',
  'Friedrich', 'Karl', 'Carl', 'Ludwig', 'Otto', 'Ernst', 'Walter', 'Herbert',
  'Georg', 'Robert', 'Richard', 'Rudolf', 'Albert', 'Anton', 'Franz', 'Josef',
  'Maximilian', 'Felix', 'Leon', 'Luca', 'Finn', 'Emil', 'Oskar', 'Theo',
  'Henry', 'Henri', 'Anton', 'Julian', 'Fabian', 'Dominik', 'Tobias', 'Kilian',
  'Moritz', 'Vincent', 'Konstantin', 'Leopold', 'Ferdinand', 'Valentin',
  'Timon', 'Nathanael', 'Nathanael', 'Immanuel', 'Emanuel', 'Samuel', 'Silas',
];

// Doppelte entfernen, Reihenfolge erhalten
module.exports = [...new Set(NAMEN)];
