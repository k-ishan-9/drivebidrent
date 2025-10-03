const { name } = require("ejs");

const rentals=[
    {
        id:1,
        name:"Trax Toofan",
        image:"https://www.pngfind.com/pngs/m/73-734475_force-toofan-hd-png-download.png",
        cost:"15 rupees",
        mileage:"15 km",
        ac:"yes",
        driver:"yes",
        capacity:"13",
      
    },

    {
        id:2,
        name:"Trax Traveller",
        image:"https://www.91trucks.com/_next/image?url=https%3A%2F%2Fimages.91trucks.com%2Fbuses%2Fmodels%2F71%2F1548%2Fforce-traveller-3350-super-796998490.jpg%3Fw%3D350%26h%3D180&w=640&q=75",
        cost:"18 rupees",
        mileage:"13 km",
        ac:"yes",
        driver:"yes",
        capacity:"26",
    },

    {
        id:3,
        name:"Toyota Innova",
        image:"https://cdni.autocarindia.com/Utils/ImageResizer.ashx?n=https://cdni.autocarindia.com/ExtraImages/20230405103153_Innova_1.jpg&w=700&c=1",
        cost:"17 rupees",
        mileage:"14 km",
        ac:"yes",
        driver:"yes",
        capacity:"8",
    },

    {
        id:4,
        name:"Hyundai Creta",
        image:"https://trident-group.s3.ap-south-1.amazonaws.com/hyundai/models/colors/1705922962.png",
        cost:"20 rupees",
        mileage:"16 km",
        ac:"yes",
        driver:"yes",
        capacity:"5",
    },

    {
        id:5,
        name:"Toyota Fortuner",
        image:"https://akm-img-a-in.tosshub.com/indiatoday/images/story/201609/toyota-fortuner_story_647_091416044216.jpg?VersionId=PPZmXaEGWYlavAlxVYwgTxA1OJQm6rSi&size=690:388",
        cost:"25 rupees",
        mileage:"12 km",
        ac:"yes",
        driver:"yes",
        capacity:"7",
    },

    {
        id:6,
        name:"Mahindra Thar",
        image:"https://offers.caimahindra.com/uploads/product/Thar%20Deep%20Grey.png",
        cost:"22 rupees",
        mileage:"10 km",
        ac:"yes",
        driver:"yes",
        capacity:"4",
    }

];
module.exports=rentals;