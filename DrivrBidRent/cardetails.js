const { name } = require("ejs");

const cars=[
    {
        id:1,
        name:"Kia Sonet HTK Plus",
        image:"https://i.ibb.co/T9F2sFp/Screenshot-2025-02-20-002536.png",
        year:"2023",
        milage:"25 km",
        condition:"Excellent",
        fueltype:"Petrol",
        transmission:"Manual",
      
    },

    {
        id:2,
        name:"Maruti Zen Estilo Lxi",
        image:"https://i.ibb.co/DDmhB48D/Screenshot-2025-02-23-153301.png",
        year:"2009",
        milage:"35 km",
        condition:"Excellent",
        fueltype:"Diesel",
        transmission:"Manual",
    },

    {
        id:3,
        name:"Skoda Rapid",
        image:"https://i.ibb.co/NfJHnXw/Screenshot-2025-02-23-162450.png",
        year:"2017",
        milage:"15 km",
        condition:"Excellent",
        fueltype:"Diesel",
        transmission:"Automatic",
    },

    {
        id:4,
        name:"Hyundai Creta",
        image:"https://trident-group.s3.ap-south-1.amazonaws.com/hyundai/models/colors/1705922962.png",
        year:"2021",
        milage:"20 km",
        condition:"Good",
        fueltype:"Petrol",
        transmission:"Manual",
    },

    {
        id:5,
        name:"Toyota Fortuner",
        image:"https://akm-img-a-in.tosshub.com/indiatoday/images/story/201609/toyota-fortuner_story_647_091416044216.jpg?VersionId=PPZmXaEGWYlavAlxVYwgTxA1OJQm6rSi&size=690:388",
        year:"2020",
        milage:"25 km",
        condition:"Good",
        fueltype:"Diesel",
        transmission:"Manual",
    },

    {
        id:6,
        name:"Mahindra Thar",
        image:"https://offers.caimahindra.com/uploads/product/Thar%20Deep%20Grey.png",
        year:"2022",
        milage:"10 km",
        condition:"Excellent",
        fueltype:"Diesel",
        transmission:"Automatic",
    }

];
module.exports=cars;