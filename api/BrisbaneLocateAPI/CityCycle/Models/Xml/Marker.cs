using System;
using System.Xml.Serialization;
using System.Collections.Generic;

namespace CityCycle.Models.Xml
{
    [XmlRoot(ElementName = "marker")]
    public class Marker
    {
        [XmlAttribute(AttributeName = "name")]
        public string Name { get; set; }
        [XmlAttribute(AttributeName = "number")]
        public string Number { get; set; }
        [XmlAttribute(AttributeName = "address")]
        public string Address { get; set; }
        [XmlAttribute(AttributeName = "fullAddress")]
        public string FullAddress { get; set; }
        [XmlAttribute(AttributeName = "lat")]
        public string Lat { get; set; }
        [XmlAttribute(AttributeName = "lng")]
        public string Lng { get; set; }
        [XmlAttribute(AttributeName = "open")]
        public string Open { get; set; }
        [XmlAttribute(AttributeName = "bonus")]
        public string Bonus { get; set; }
    }

    [XmlRoot(ElementName = "markers")]
    public class Markers
    {
        [XmlElement(ElementName = "marker")]
        public List<Marker> Marker { get; set; }
    }

    [XmlRoot(ElementName = "arrondissement")]
    public class Arrondissement
    {
        [XmlAttribute(AttributeName = "number")]
        public string Number { get; set; }
        [XmlAttribute(AttributeName = "minLat")]
        public string MinLat { get; set; }
        [XmlAttribute(AttributeName = "minLng")]
        public string MinLng { get; set; }
        [XmlAttribute(AttributeName = "maxLat")]
        public string MaxLat { get; set; }
        [XmlAttribute(AttributeName = "maxLng")]
        public string MaxLng { get; set; }
    }

    [XmlRoot(ElementName = "arrondissements")]
    public class Arrondissements
    {
        [XmlElement(ElementName = "arrondissement")]
        public Arrondissement Arrondissement { get; set; }
    }

    [XmlRoot(ElementName = "carto")]
    public class Carto
    {
        [XmlElement(ElementName = "markers")]
        public Markers Markers { get; set; }
        [XmlElement(ElementName = "arrondissements")]
        public Arrondissements Arrondissements { get; set; }
    }

}