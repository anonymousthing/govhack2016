using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CityCycle.Models
{
    public class CityCycleStation
    {
        public UInt32 Id { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
        public string FullAddress { get; set; }
        public Decimal Latitude { get; set; }
        public Decimal Longitude { get; set; }
        public bool Open { get; set; }
        public UInt32 AvailableBikes { get; set; }
        public UInt32 Free { get; set; }
        public UInt32 LastUpdated { get; set; }
    }
}
