// Composable untuk data produk katalog
export const useCatalogData = () => {
  // Data produk berdasarkan kategori dan subcategory
  const catalogProducts: Record<string, Record<string, any[]>> = {
    Kalung: {
      anak: [
        {
          id: 1,
          title: "Kalung Anak Karakter",
          image: "/img/kids-necklace.jpg",
          name: "Kalung Anak Karakter Lucu",
          price: "Rp 850.000",
          description: "Kalung emas untuk anak dengan desain karakter yang lucu dan aman dipakai",
          specs: ["Emas 22K", "Berat: 1.2 gram", "Panjang: 30cm", "Clasp aman untuk anak"],
          images: ["/img/kids-necklace.jpg"],
        },
        {
          id: 2,
          title: "Kalung Anak Liontin",
          image: "/img/kids-set.jpg",
          name: "Kalung Anak dengan Liontin",
          price: "Rp 950.000",
          description: "Kalung emas anak dengan liontin bentuk hati yang cantik",
          specs: ["Emas 20K", "Berat: 1.5 gram", "Panjang: 32cm", "Design khusus anak"],
          images: ["/img/kids-set.jpg"],
        },
      ],
      fashion: [
        {
          id: 3,
          title: "Kalung Fashion Elegan",
          image: "/img/necklace2.jpg",
          name: "Kalung Fashion Modern",
          price: "Rp 3.500.000",
          description: "Kalung fashion dengan desain modern dan elegan untuk tampilan mewah",
          specs: ["Emas 18K", "Berat: 4.5 gram", "Panjang: 45cm", "Design eksklusif"],
          images: ["/img/necklace2.jpg", "/img/necklace.jpg"],
        },
        {
          id: 4,
          title: "Kalung Layer",
          image: "/img/necklace.jpg",
          name: "Kalung Fashion Layer",
          price: "Rp 4.200.000",
          description: "Kalung dengan design layer yang trendy dan menarik",
          specs: ["Emas 18K", "Berat: 5.2 gram", "Panjang: 40-45cm", "Multi layer design"],
          images: ["/img/necklace.jpg", "/img/necklace2.jpg"],
        },
      ],
      pria: [
        {
          id: 5,
          title: "Kalung Pria Masculine",
          image: "/img/necklace-man.jpg",
          name: "Kalung Pria Maskulin",
          price: "Rp 5.500.000",
          description: "Kalung emas untuk pria dengan design maskulin dan kuat",
          specs: ["Emas 22K", "Berat: 8.5 gram", "Panjang: 50cm", "Design masculine"],
          images: ["/img/necklace-man.jpg"],
        },
      ],
    },
    Liontin: {
      anak: [
        {
          id: 6,
          title: "Liontin Anak Bintang",
          image: "/img/pandent.jpg",
          name: "Liontin Anak Motif Bintang",
          price: "Rp 650.000",
          description: "Liontin emas untuk anak dengan motif bintang yang cantik",
          specs: ["Emas 20K", "Berat: 0.8 gram", "Ukuran: 1.5cm", "Cocok untuk anak"],
          images: ["/img/pandent.jpg"],
        },
      ],
      fashion: [
        {
          id: 7,
          title: "Liontin Fashion Mewah",
          image: "/img/pandent2.jpg",
          name: "Liontin Fashion Premium",
          price: "Rp 2.800.000",
          description: "Liontin fashion dengan design premium dan mewah",
          specs: ["Emas 18K", "Berat: 3.2 gram", "Ukuran: 2.5cm", "Berlian accent"],
          images: ["/img/pandent2.jpg", "/img/pandent.jpg"],
        },
      ],
    },
    Anting: {
      anak: [
        {
          id: 8,
          title: "Anting Anak Lucu",
          image: "/img/kidsearring.jpg",
          name: "Anting Anak Karakter",
          price: "Rp 550.000",
          description: "Anting emas untuk anak dengan design karakter lucu",
          specs: ["Emas 20K", "Berat: 0.6 gram/pasang", "Sistem tusuk aman", "Hypoallergenic"],
          images: ["/img/kidsearring.jpg"],
        },
      ],
      fashion: [
        {
          id: 9,
          title: "Anting Fashion Elegan",
          image: "/img/earrings1.jpg",
          name: "Anting Fashion Premium",
          price: "Rp 2.500.000",
          description: "Anting fashion dengan design elegan dan mewah",
          specs: ["Emas 18K", "Berat: 2.8 gram/pasang", "Berlian accent", "Sistem hook"],
          images: ["/img/earrings1.jpg", "/img/earrings2.jpg"],
        },
        {
          id: 10,
          title: "Anting Drop",
          image: "/img/earring.jpg",
          name: "Anting Drop Fashion",
          price: "Rp 3.200.000",
          description: "Anting drop dengan design modern dan cantik",
          specs: ["Emas 18K", "Berat: 3.5 gram/pasang", "Panjang: 4cm", "Drop design"],
          images: ["/img/earring.jpg", "/img/earring2.jpg"],
        },
      ],
    },
    Cincin: {
      anak: [
        {
          id: 11,
          title: "Cincin Anak Mini",
          image: "/img/kidsring.jpg",
          name: "Cincin Anak Karakter",
          price: "Rp 450.000",
          description: "Cincin emas untuk anak dengan ukuran mini dan aman",
          specs: ["Emas 20K", "Berat: 0.7 gram", "Ring size: Anak", "Design playful"],
          images: ["/img/kidsring.jpg"],
        },
      ],
      fashion: [
        {
          id: 12,
          title: "Cincin Fashion Berlian",
          image: "/img/ring2.jpg",
          name: "Cincin Fashion dengan Berlian",
          price: "Rp 4.500.000",
          description: "Cincin fashion dengan berlian untuk tampilan mewah",
          specs: ["Emas 18K", "Berat: 3.8 gram", "Berlian 0.25ct", "Ring size: 5-7"],
          images: ["/img/ring2.jpg", "/img/ring.jpg"],
        },
        {
          id: 13,
          title: "Cincin Solitaire",
          image: "/img/ring.jpg",
          name: "Cincin Solitaire Elegan",
          price: "Rp 5.800.000",
          description: "Cincin solitaire dengan design klasik dan elegan",
          specs: ["Emas 18K", "Berat: 4.2 gram", "Berlian 0.35ct", "Classic design"],
          images: ["/img/ring.jpg", "/img/rings1.jpg"],
        },
      ],
      pria: [
        {
          id: 14,
          title: "Cincin Pria Bold",
          image: "/img/mensring.jpg",
          name: "Cincin Pria Maskulin",
          price: "Rp 6.500.000",
          description: "Cincin emas untuk pria dengan design bold dan maskulin",
          specs: ["Emas 22K", "Berat: 7.5 gram", "Ring size: 8-11", "Bold design"],
          images: ["/img/mensring.jpg", "/img/mensring1.jpg"],
        },
      ],
    },
    Gelang: {
      anak: [
        {
          id: 15,
          title: "Gelang Anak Manik",
          image: "/img/kids-bracelet.jpg",
          name: "Gelang Anak dengan Manik",
          price: "Rp 750.000",
          description: "Gelang emas untuk anak dengan manik-manik lucu",
          specs: ["Emas 20K", "Berat: 1.5 gram", "Panjang: 15cm", "Adjustable"],
          images: ["/img/kids-bracelet.jpg"],
        },
      ],
      fashion: [
        {
          id: 16,
          title: "Gelang Fashion Chain",
          image: "/img/bracelet3.jpg",
          name: "Gelang Fashion Rantai",
          price: "Rp 3.200.000",
          description: "Gelang fashion dengan rantai elegan",
          specs: ["Emas 18K", "Berat: 4.5 gram", "Panjang: 18cm", "Chain design"],
          images: ["/img/bracelet3.jpg"],
        },
      ],
      bangle: [
        {
          id: 17,
          title: "Bangle Klasik",
          image: "/img/bangle2.jpg",
          name: "Bangle Emas Klasik",
          price: "Rp 8.500.000",
          description: "Bangle emas dengan design klasik dan mewah",
          specs: ["Emas 22K", "Berat: 12.5 gram", "Diameter: 6cm", "Classic bangle"],
          images: ["/img/bangle2.jpg", "/img/bangle1.jpg"],
        },
        {
          id: 18,
          title: "Bangle Ukir",
          image: "/img/bangle1.jpg",
          name: "Bangle dengan Ukiran",
          price: "Rp 9.800.000",
          description: "Bangle emas dengan ukiran tradisional yang indah",
          specs: ["Emas 22K", "Berat: 14.2 gram", "Diameter: 6cm", "Hand carved"],
          images: ["/img/bangle1.jpg", "/img/bangle2.jpg"],
        },
      ],
      pria: [
        {
          id: 19,
          title: "Gelang Pria Rantai",
          image: "/img/mens-brecelet.jpg",
          name: "Gelang Pria Chain",
          price: "Rp 7.500.000",
          description: "Gelang rantai untuk pria dengan design maskulin",
          specs: ["Emas 22K", "Berat: 10.5 gram", "Panjang: 20cm", "Heavy chain"],
          images: ["/img/mens-brecelet.jpg"],
        },
      ],
    },
    Giwang: {
      anak: [
        {
          id: 20,
          title: "Giwang Anak Bulat",
          image: "/img/kidsearring.jpg",
          name: "Giwang Anak Bulat Mini",
          price: "Rp 480.000",
          description: "Giwang emas untuk anak dengan bentuk bulat mini",
          specs: ["Emas 20K", "Berat: 0.5 gram/pasang", "Diameter: 1cm", "Clasp aman"],
          images: ["/img/kidsearring.jpg"],
        },
      ],
      fashion: [
        {
          id: 21,
          title: "Giwang Fashion Besar",
          image: "/img/earring.jpg",
          name: "Giwang Fashion Statement",
          price: "Rp 3.800.000",
          description: "Giwang fashion dengan ukuran statement yang menarik",
          specs: ["Emas 18K", "Berat: 4.2 gram/pasang", "Diameter: 3.5cm", "Statement piece"],
          images: ["/img/earring.jpg", "/img/earring2.jpg"],
        },
        {
          id: 22,
          title: "Giwang Elegan",
          image: "/img/earring2.jpg",
          name: "Giwang Fashion Elegan",
          price: "Rp 3.200.000",
          description: "Giwang dengan design elegan untuk acara formal",
          specs: ["Emas 18K", "Berat: 3.8 gram/pasang", "Diameter: 3cm", "Elegant design"],
          images: ["/img/earring2.jpg", "/img/earring.jpg"],
        },
      ],
    },
  };

  // Fungsi untuk mendapatkan produk berdasarkan kategori dan subcategory
  const getProducts = (category: string, subcategory: string) => {
    return catalogProducts[category]?.[subcategory] || [];
  };

  // Fungsi untuk mendapatkan detail produk
  const getProductDetail = (category: string, subcategory: string, id: number) => {
    const products = getProducts(category, subcategory);
    return products.find((p) => p.id === id) || null;
  };

  return {
    catalogProducts,
    getProducts,
    getProductDetail,
  };
};
