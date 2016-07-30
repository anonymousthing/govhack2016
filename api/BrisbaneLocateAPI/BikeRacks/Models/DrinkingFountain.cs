using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CsvIngestion.Models
{
    public class DrinkingFountain
    {
        // Ward,Suburb,Property_Code,Park_Name,Node_Id,Node_Name,Item_Id,Item_Type,Item_Description,Latitude,Longitude,Easting,Northing
        public string Area { get; set; }
        public string Suburb { get; set; }
        public string PropertyCode { get; set; }
        public string ParkName { get; set; }
        public string NodeId { get; set; }
        public string NodeName { get; set; }
        public string ItemId { get; set; }
        public string ItemType { get; set; }
        public string ItemDescription { get; set; }
        public Decimal Latitude { get; set; }
        public Decimal Longitude { get; set; }
    }
}
