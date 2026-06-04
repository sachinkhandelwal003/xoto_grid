import { Card, Typography, Row, Col, Input, Button } from "antd";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const { Title, Text } = Typography;

export default function AgentCreateDeal(){

  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const lead = location.state?.lead || {};

  return(
    <div className="p-6">

      <Title level={3}>Create Deal</Title>

      <Card className="shadow-sm rounded-xl">

        <Row gutter={[16,16]}>

          <Col xs={24} md={12}>
            <Text>Client Name</Text>
            <Input defaultValue={lead.name}/>
          </Col>

          <Col xs={24} md={12}>
            <Text>Project</Text>
            <Input defaultValue={lead.project}/>
          </Col>

          <Col xs={24} md={12}>
            <Text>Deal Amount</Text>
            <Input placeholder="Enter amount"/>
          </Col>

          <Col xs={24} md={12}>
            <Text>Commission</Text>
            <Input placeholder="Auto calculate later"/>
          </Col>

          <Col span={24}>
            <Button
              type="primary"
              size="large"
              onClick={()=>navigate("/deals")}
            >
              Save Deal
            </Button>
          </Col>

        </Row>

      </Card>

    </div>
  )
}
