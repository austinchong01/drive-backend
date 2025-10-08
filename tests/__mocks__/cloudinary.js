const cloudinary = {
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn().mockImplementation(() => {
        const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return Promise.resolve({
          secure_url: `https://fake-cloudinary-url.com/test-${uniqueId}.jpg`,
          public_id: `fake_public_id_${uniqueId}`,
          resource_type: "image",
        });
      }),
      destroy: jest.fn().mockResolvedValue({
        result: "ok",
      }),
    },
  },
};

module.exports = cloudinary;