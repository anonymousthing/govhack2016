using CsvIngestion.Models;
using CsvHelper.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CsvIngestion.Mappings
{
    public sealed class DrinkingFountainMap : CsvClassMap<DrinkingFountain>
    {
        public DrinkingFountainMap()
        {
            Map(m => m.Area).Name("Ward");
            Map(m => m.Suburb).Name("Suburb");
            Map(m => m.PropertyCode).Name("Property_Code");
            Map(m => m.ParkName).Name("Park_Name");
            Map(m => m.NodeId).Name("Node_Id");
            Map(m => m.NodeName).Name("Node_Name");
            Map(m => m.ItemId).Name("Item_Id");
            Map(m => m.ItemType).Name("Item_Type");
            Map(m => m.ItemDescription).Name("Item_Description");
            Map(m => m.Latitude).Name("Latitude");
            Map(m => m.Longitude).Name("Longitude");
        }
    }
}
