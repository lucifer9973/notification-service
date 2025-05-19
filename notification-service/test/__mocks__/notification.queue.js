module.exports = {
  connect: jest.fn().mockResolvedValue(true),
  publish: jest.fn().mockResolvedValue(true),
  consume: jest.fn().mockResolvedValue(true),
};
